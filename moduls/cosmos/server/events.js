initCosmosEventsServer = function() {

Game.SpaceEvents.Collection._ensureIndex({
	user_id: 1
});

Game.SpaceEvents.actualize = function() {
	var timeCurrent = Game.getCurrentTime();

	// Try to attack player
	var timeLastAttack = Game.Planets.getLastAttackTime();
	var attacks = Math.floor( (timeCurrent - timeLastAttack) / Game.Cosmos.ATTACK_PLAYER_PERIOD );

	if (attacks > 0 && Game.User.getLevel() > 0) {
		for (var i = 0; i < attacks; i++) {
			var targetPlanet = null;
			var chances = Game.Planets.getReptileAttackChance();

			if (chances.home >= Game.Random.interval(0, 100)) {
				// choose base planet
				targetPlanet = Game.Planets.getBase();
			} else if (chances.colony >= Game.Random.interval(0, 100)) {
				// choose from colonies, exclude base planet
				var colonies = Game.Planets.getColonies();
				var n = colonies.length;
				while (n-- > 0) {
					if (colonies[n].isHome) {
						colonies.splice(n, 1);
					}
				}
				if (colonies.length > 0) {
					targetPlanet = colonies[ Game.Random.interval(0, colonies.length - 1) ];
				}
			}

			if (targetPlanet) {
				Game.SpaceEvents.sendReptileFleetToPlanet(targetPlanet._id);
				break; // maximum 1 simultaneous attack
			}
		}

		Game.Planets.setLastAttackTime( timeLastAttack + attacks * Game.Cosmos.ATTACK_PLAYER_PERIOD );
	}

	// Try to spawn trade fleet
	var tradeFleetsCount = Game.SpaceEvents.Collection.find({
		user_id: Meteor.userId(),
		type: Game.SpaceEvents.type.SHIP,
		status: Game.SpaceEvents.status.STARTED,
		'info.mission.type': 'tradefleet'
	}).count();

	if (tradeFleetsCount <= 0) {
		Game.SpaceEvents.spawnTradeFleet();	
	}
}

Game.SpaceEvents.update = function(event) {
	if (!event._id || !event.user_id) {
		return null;
	}

	var data = _.omit(event, '_id');

	Game.SpaceEvents.Collection.update({
		_id: event._id
	}, {
		$set: data
	}); 
	
	return data;
}

Game.SpaceEvents.add = function(event) {
	event.user_id = Meteor.userId();
	return Game.SpaceEvents.Collection.insert(event);
}

Game.SpaceEvents.complete = function(task) {
	if (!task) {
		return;
	}

	var event = Game.SpaceEvents.Collection.findOne({
		_id: task.eventId,
		user_id: task.user_id
	});

	if (!event
	 || event.status == Game.SpaceEvents.status.FINISHED
	 || event.timeEnd > Game.getCurrentTime()
	) {
		return;
	}

	switch (event.type) {
		case Game.SpaceEvents.type.SHIP:
			Game.SpaceEvents.completeShip(event);
			break;
		case Game.SpaceEvents.type.REINFORCEMENT:
			Game.SpaceEvents.completeReinforcement(event);
			break;
	}
	
	event.status = Game.SpaceEvents.status.FINISHED;
	Game.SpaceEvents.Collection.update({ _id: event._id }, event);
}

// ----------------------------------------------------------------------------
// Earth reinforcement events
// ----------------------------------------------------------------------------

Game.SpaceEvents.sendReinforcement = function(options) {
	// mandatory options
	if (options.startTime == undefined) {
		throw new Meteor.Error('Не задано время старта');
	}

	if (options.durationTime == undefined) {
		throw new Meteor.Error('Не задано время за которое прибудет подкрепление');
	}

	if (options.units == undefined) {
		throw new Meteor.Error('Не указаны войска');
	}

	// add event
	var eventId = Game.SpaceEvents.add({
		type: Game.SpaceEvents.type.REINFORCEMENT,
		status: Game.SpaceEvents.status.STARTED,
		timeStart: options.startTime,
		timeEnd: options.startTime + options.durationTime,
		info: {
			units: options.units
		}
	});

	// add task into queue
	if (eventId) {
		Game.Queue.add({
			type: 'spaceEvent',
			eventId: eventId,
			startTime: options.startTime,
			time: options.durationTime
		});
	}
}

Game.SpaceEvents.completeReinforcement = function(event) {
	// kill random count on the way
	var killedPercent = Game.Random.interval(0, 30);
	event.info.killedPercent = killedPercent;
	var k = 1 - (killedPercent / 100);

	var units = event.info.units;
	var arrived = {};
	for (var side in units) {
		arrived[side] = {};
		for (var group in units[side]) {
			arrived[side][group] = {};
			for (var name in units[side][group]) {
				var count = parseInt( units[side][group][name], 10 );
				var result = Math.floor( count * k );
				// if result < 1, check chance instead of percents
				if (result < 1) {
					result = Game.Random.random() > k ? 1 : 0;
				}
				// save result
				arrived[side][group][name] = result;
			}
		}
	}

	// save reinforcements
	Game.Earth.addReinforcement( arrived );
}

// ----------------------------------------------------------------------------
// Ship events
// ----------------------------------------------------------------------------

Game.SpaceEvents.sendShip = function(options) {
	// mandatory options
	if (options.startPosition === undefined) {
		throw new Meteor.Error('Не задана точка старта полета');
	}

	if (options.targetPosition === undefined) {
		throw new Meteor.Error('Не задана точка финиша полета');
	}

	if (options.targetType === undefined) {
		throw new Meteor.Error('Не задан тип цели');
	}

	if (options.targetId === undefined) {
		throw new Meteor.Error('Не задан id цели');
	}

	if (options.startTime === undefined) {
		throw new Meteor.Error('Не задано время старта полета');
	}

	if (options.flyTime === undefined) {
		throw new Meteor.Error('Не задана продолжительность полета');
	}

	if (options.engineLevel === undefined) {
		throw new Meteor.Error('Не задан уровень двигателей');
	}

	// not required options
	if (options.startPlanetId === undefined) {
		options.startPlanetId = null;
	}

	if (options.armyId === undefined) {
		options.armyId = null;
	}

	if (options.mission === undefined) { 
		options.mission = null;
	}

	if (options.isHumans === undefined) {
		options.isHumans = false;
	}

	if (options.isOneway === undefined) {
		options.isOneway = true;
	}

	// insert event
	var eventId = Game.SpaceEvents.add({
		type: Game.SpaceEvents.type.SHIP,
		status: Game.SpaceEvents.status.STARTED,
		timeStart: options.startTime,
		timeEnd: options.startTime + options.flyTime,
		info: {
			isHumans: options.isHumans,
			isOneway: options.isOneway,
			engineLevel: options.engineLevel,
			startPosition: options.startPosition,
			startPlanetId: options.startPlanetId,
			targetPosition: options.targetPosition,
			targetType: options.targetType,
			targetId: options.targetId,
			mission: options.mission,
			armyId: options.armyId
		}
	});

	// add task into queue
	if (eventId) {
		Game.Queue.add({
			type: 'spaceEvent',
			eventId: eventId,
			startTime: options.startTime,
			time: options.flyTime
		});
	}
}

Game.SpaceEvents.spawnTradeFleet = function() {
	// find available planets
	var planets = Game.Planets.getAll().fetch();
	var n = planets.length;

	while (n-- > 0) {
		if (!planets[n].mission || planets[n].isHome) {
			planets.splice(n, 1);
		}
	}

	if (planets.length >= 2) {
		// get two random planets
		var randFrom = Game.Random.interval(0, planets.length - 1);
		var randTo = randFrom;
		while (randTo == randFrom) {
			randTo = Game.Random.interval(0, planets.length - 1);
		}

		var startPlanet = planets[ randFrom ];
		var targetPlanet = planets[ randTo ];

		// send ship
		var timeCurrent = Game.getCurrentTime();

		var startPosition = {
			x: startPlanet.x,
			y: startPlanet.y
		}

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		}

		var mission = Game.Planets.generateMission(startPlanet);
		if (!mission) {
			mission = {
				level: Game.Random.interval(1, 10)
			};
		}
		mission.type = 'tradefleet';

		var engineLevel = 0;
		var flyTime = Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel);

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  startPlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      timeCurrent,
			flyTime:        flyTime,
			isHumans:       false,
			engineLevel:    engineLevel,
			mission:        mission
		}

		Game.SpaceEvents.sendShip(shipOptions);
	}
}

Game.SpaceEvents.sendReptileFleetToPlanet = function(planetId) {
	// get target planet
	var targetPlanet = Game.Planets.getOne(planetId);
	if (!targetPlanet) {
		throw new Meteor.Error('Нет такой планеты');
	}

	// find available start planets
	var planets = Game.Planets.getAll().fetch();
	var n = planets.length;

	while (n-- > 0) {
		if (!planets[n].mission || planets[n].isHome) {
			planets.splice(n, 1);
		}
	}

	if (planets.length > 0) {

		// choose start planet
		var rand = Game.Random.interval(0, planets.length - 1);
		var startPlanet = planets[rand];

		// send ship
		var timeCurrent = Game.getCurrentTime();

		var startPosition = {
			x: startPlanet.x,
			y: startPlanet.y
		}

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		}

		var engineLevel = Game.Planets.getEngineLevel();

		var mission = (targetPlanet.isHome)
			? Game.Planets.getReptileAttackMission()
			: Game.Planets.generateMission(targetPlanet);

		if (!mission) {
			throw new Meteor.Error('Не получилось сгенерировать миссию для нападения');
		}

		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  startPlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      timeCurrent,
			flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			isHumans:       false,
			engineLevel:    engineLevel,
			mission:        mission
		}

		Game.SpaceEvents.sendShip(shipOptions);
	}
}

Game.SpaceEvents.completeShip = function(event) {
	// --------------------------------
	// Arrived to planet
	// --------------------------------
	if (event.info.targetType ==  Game.SpaceEvents.target.PLANET) {

		var planetId = event.info.targetId;
		var planet = Game.Planets.getOne(planetId);

		if (!planet) {
			return; // no such planet
		}

		// ----------------------------
		// Humans arrived
		// ----------------------------
		if (event.info.isHumans) {

			// calculate battle results
			var battleResult = null;
			var userArmy = null;
			var enemyArmy = null;

			if (planet.mission) {
				var userLocation = (event.info.startPlanetId)
					? event.info.startPlanetId
					: event.info.startPosition;

				var battleOptions = {
					missionType: planet.mission.type,
					missionLevel: planet.mission.level,
					location: planet._id,
					userLocation: userLocation,
					enemyLocation: planet._id,
					artefacts: Game.Planets.getArtefacts(planet)
				};

				var enemyFleet = Game.Planets.getFleetUnits(planet._id);
				enemyArmy = { reptiles: { fleet: enemyFleet } };

				var userFleet = Game.SpaceEvents.getFleetUnits(event._id);
				userArmy = { army: { fleet: userFleet } };

				battleResult = Game.Unit.performBattle(userArmy, enemyArmy, battleOptions);
				userArmy = battleResult.userArmy;
				enemyArmy = battleResult.enemyArmy;

				if (userArmy && enemyArmy) {
					// tie
					Game.Unit.updateArmy(event.info.armyId, userArmy);
					planet.mission.units = enemyArmy.reptiles.fleet;
				} else if (!userArmy && enemyArmy) {
					// reptiles won
					Game.Unit.removeArmy(event.info.armyId);
					planet.mission.units = enemyArmy.reptiles.fleet;
				} else if (userArmy && !enemyArmy) {
					// humans won
					Game.Unit.updateArmy(event.info.armyId, userArmy);
					planet.mission = null;
				} else {
					// everyone died
					Game.Unit.removeArmy(event.info.armyId);
					planet.mission = null;
				}

				// add reward
				if (battleResult.reward) {
					Game.Resources.add( battleResult.reward );
				}

				// add artefacts
				if (battleResult.artefacts) {
					planet.timeArtefacts = event.timeEnd;
					Game.Resources.add( battleResult.artefacts );
				}
			}

			// update planet info
			if (event.info.isOneway && (!battleResult || (userArmy && !enemyArmy))) {
				// stay on planet
				if (planet.isHome || planet.armyId) {
					// merge army
					var destArmyId = (planet.isHome) ? Game.Unit.getHomeArmy()._id : planet.armyId;
					Game.Unit.mergeArmy(event.info.armyId, destArmyId);
				} else {
					// move army
					Game.Unit.moveArmy(event.info.armyId, Game.Unit.location.PLANET);
					planet.armyId = event.info.armyId;
				}
			} else if (!battleResult || userArmy) {
				// return ship
				var startPosition = event.info.targetPosition;
				var targetPosition = event.info.startPosition;
				var engineLevel = event.info.engineLevel;

				var shipOptions = {
					startPosition:  startPosition,
					startPlanetId:  event.info.targetId,
					targetPosition: targetPosition,
					targetType:     Game.SpaceEvents.target.PLANET,
					targetId:       event.info.startPlanetId,
					startTime:      event.timeEnd,
					flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
					isHumans:       true,
					isOneway:       true,
					engineLevel:    engineLevel,
					mission:        null,
					armyId:         event.info.armyId
				}

				Game.SpaceEvents.sendShip(shipOptions);
			}

			planet.timeRespawn = event.timeEnd + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
			Game.Planets.update(planet);

			if (!battleResult || (userArmy && !enemyArmy)) {
				if (!planet.isDiscovered) {
					Meteor.call('planet.discover', planet._id);
				}
			}

		// ----------------------------
		// Reptiles arrived
		// ----------------------------
		} else {

			if (!event.info.mission) {
				return; // empty reptiles ship!
			}

			if (!planet.mission && (planet.armyId || planet.isHome)) {
				// reptiles attack our planet
				// get enemy fleet
				var enemyFleet = Game.SpaceEvents.getFleetUnits(event._id);
				var enemyArmy = (enemyFleet)
					? { reptiles: { fleet: enemyFleet } }
					: null;
				
				// get user fleet + defense
				var userFleet = Game.Planets.getFleetUnits(planet._id);
				var userDefense = Game.Planets.getDefenseUnits(planet._id);
				
				var userArmy = null;
				if (userFleet || userDefense) {
					userArmy = { army: {} };
					if (userFleet) {
						userArmy.army.fleet = userFleet;
					}
					if (userDefense) {
						userArmy.army.defense = userDefense;
					}
				}

				if (enemyArmy && userArmy) {
					var enemyLocation = (event.info.startPlanetId)
						? event.info.startPlanetId
						: event.info.startPosition;

					var battleOptions = {
						missionType: event.info.mission.type,
						missionLevel: event.info.mission.level,
						location: planet._id,
						userLocation: planet._id,
						enemyLocation: enemyLocation
					}

					// perform battle
					var battleResult = Game.Unit.performBattle(userArmy, enemyArmy, battleOptions);
					userArmy = battleResult.userArmy;
					enemyArmy = battleResult.enemyArmy;

					// need this to update user army
					var userArmyId = (planet.isHome) ? Game.Unit.getHomeArmy()._id : planet.armyId;

					if (userArmy && enemyArmy) {
						// tie
						Game.Unit.updateArmy(userArmyId, userArmy);
						planet.mission.units = enemyArmy.reptiles.fleet;
					} else if (!userArmy && enemyArmy) {
						// reptiles won
						Game.Unit.removeArmy(userArmyId);
						if (planet.isHome) {
							event.info.mission.units = enemyArmy.reptiles.fleet;
						} else {
							planet.armyId = null;
							planet.mission = {
								type: 'defencefleet',
								level: event.info.mission.level,
								units: enemyArmy.reptiles.fleet
							}
						}
					} else if (userArmy && !enemyArmy) {
						// humans won
						Game.Unit.updateArmy(userArmyId, userArmy);
						event.info.mission = null;
					} else {
						// everyone died
						Game.Unit.removeArmy(userArmyId);
						if (!planet.isHome) {
							planet.armyId = null;
						}
						event.info.mission = null;
					}

					// collect and reset artefacts time
					if (enemyArmy && !userArmy && !planet.isHome) {
						var delta = event.timeEnd - planet.timeArtefacts;
						var count = Math.floor( delta / Game.Cosmos.COLLECT_ARTEFACTS_PERIOD );
						if (count > 0){
							var artefacts = Game.Planets.getArtefacts(planet, count);
							if (artefacts) {
								Game.Resources.add(artefacts);
							}
						}
						planet.timeArtefacts = null;
					}
				}

				if (enemyArmy && (userArmy || planet.isHome)) {
					// return reptiles ship
					var startPosition = event.info.targetPosition;
					var targetPosition = event.info.startPosition;
					var engineLevel = event.info.engineLevel;

					var shipOptions = {
						startPosition:  startPosition,
						startPlanetId:  event.info.targetId,
						targetPosition: targetPosition,
						targetType:     Game.SpaceEvents.target.PLANET,
						targetId:       event.info.startPlanetId,
						startTime:      event.timeEnd,
						flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
						isHumans:       false,
						isOneway:       true,
						engineLevel:    engineLevel,
						mission:        event.info.mission,
						armyId:         null
					}

					Game.SpaceEvents.sendShip(shipOptions);
				}

			} else if (planet.mission) {
				// reptiles planet
				// TODO: implement mission merge!

			} else {
				// empty planet
				planet.mission = {
					type: 'defencefleet',
					level: event.info.mission.level,
					units: event.info.mission.units
				}
			}

			planet.timeRespawn = event.timeEnd + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
			Game.Planets.update(planet);
		}
	}

	// --------------------------------
	// Meet with target ship
	// --------------------------------
	if (event.info.targetType == Game.SpaceEvents.target.SHIP) {

		var targetShip = Game.SpaceEvents.getOne(event.info.targetId);
		if (!targetShip) {
			throw new Meteor.Error('Корабль с id = ' + event.info.targetId + ' не существует');
		}

		if (event.info.isHumans == targetShip.info.isHumans) {
			throw new Meteor.Error('Невозможна битва между одной стороной конфликта');
		}

		var isAlive = true;

		if (targetShip.status != Game.SpaceEvents.status.FINISHED) {
			// target is still flying
			var firstLocation = (event.info.startPlanetId)
				? event.info.startPlanetId
				: event.info.startPosition;

			var secondLocation = (targetShip.info.startPlanetId)
				? targetShip.info.startPlanetId
				: targetShip.info.startPosition;

			var battleOptions = {
				location: event.info.targetPosition,
				userLocation: event.info.isHumans ? firstLocation : secondLocation,
				enemyLocation: event.info.isHumans ? secondLocation : firstLocation
			};
			
			if (targetShip.info.mission) {
				battleOptions.missionType = targetShip.info.mission.type;
				battleOptions.missionLevel = targetShip.info.mission.level;
			} else if (event.info.mission) {
				battleOptions.missionType = event.info.mission.type;
				battleOptions.missionLevel = event.info.mission.level;
			}

			// get fleet units
			var firstFleet = Game.SpaceEvents.getFleetUnits(event._id);
			var secondFleet = Game.SpaceEvents.getFleetUnits(targetShip._id);

			// perform battle
			var userArmy = (event.info.isHumans)
				? { army: { fleet: firstFleet } }
				: { army: { fleet: secondFleet } };

			var enemyArmy = (event.info.isHumans)
				? { reptiles: { fleet: secondFleet } }
				: { reptiles: { fleet: firstFleet } };

			var battleResult = Game.Unit.performBattle(userArmy, enemyArmy, battleOptions);

			var firstArmy = (event.info.isHumans)
				? battleResult.userArmy
				: battleResult.enemyArmy;

			var secondArmy = (event.info.isHumans)
				? battleResult.enemyArmy
				: battleResult.userArmy;

			// update units
			if (firstArmy) {
				if (event.info.isHumans) {
					Game.Unit.updateArmy(event.info.armyId, firstArmy);
				} else {
					event.info.mission.units = firstArmy.reptiles.fleet;
				}
			} else {
				// first fleet destroyed
				isAlive = false;
				event.status = Game.SpaceEvents.status.FINISHED;
				Game.SpaceEvents.Collection.update({ _id: event._id }, event);
			}

			if (secondArmy) {
				if (targetShip.info.isHumans) {
					Game.Unit.updateArmy(targetShip.info.armyId, secondArmy);
				} else {
					targetShip.info.mission.units = secondArmy.reptiles.fleet;
				}
				// update target fleet
				targetShip.info.timeBattle = event.timeEnd;
				Game.SpaceEvents.Collection.update({ _id: targetShip._id }, targetShip);
			} else {
				// target fleet destroyed
				targetShip.status = Game.SpaceEvents.status.FINISHED;
				Game.SpaceEvents.Collection.update({ _id: targetShip._id}, targetShip);
			}

			// add reward
			if ((firstArmy && event.info.isHumans) || (secondArmy && targetShip.info.isHumans)) {
				Game.Resources.add( battleResult.reward );
			}
		}

		// return to base
		if (isAlive) {
			var startPosition = event.info.targetPosition;
			var targetPosition = event.info.startPosition;
			var engineLevel = event.info.engineLevel;

			var shipOptions = {
				startPosition:  startPosition,
				startPlanetId:  null,
				targetPosition: targetPosition,
				targetType:     Game.SpaceEvents.target.PLANET,
				targetId:       event.info.startPlanetId,
				startTime:      event.timeEnd,
				flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
				isHumans:       event.info.isHumans,
				engineLevel:    event.info.engineLevel,
				mission:        event.info.mission,
				armyId:         event.info.armyId
			}

			Game.SpaceEvents.sendShip(shipOptions);
		}
	}
}

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({
	'spaceEvents.attackReptFleet': function(baseId, targetId, units, targetX, targetY) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		if (!Game.SpaceEvents.checkCanSendFleet()) {
			throw new Meteor.Error('Слишком много флотов уже отправлено');
		}

		var basePlanet = Game.Planets.getOne(baseId);
		if (!basePlanet) {
			throw new Meteor.Error('Плаента не существует');
		}

		var enemyShip = Game.SpaceEvents.getOne(targetId);
		if (!enemyShip) {
			throw new Meteor.Error('Корабль не существует');
		}

		var engineLevel = Game.Planets.getEngineLevel();

		var startPosition = {
			x: basePlanet.x,
			y: basePlanet.y
		}

		var targetPosition = {
			x: targetX,
			y: targetY
		}

		// check time
		var timeCurrent = Game.getCurrentTime();
		var timeLeft = enemyShip.timeEnd - timeCurrent;
		
		var attackOptions = Game.Planets.calcAttackOptions(
			basePlanet,
			engineLevel,
			enemyShip,
			timeCurrent
		);

		if (!attackOptions || attackOptions.time >= timeLeft) {
			throw new Meteor.Error('Невозможно перехватить');
		}

		var timeAttack = attackOptions.time;

		// check and slice units
		var sourceArmyId = basePlanet.armyId;
		if (basePlanet.isHome) {
			sourceArmyId = Game.Unit.getHomeArmy()._id;
		}

		var destUnits = { army: { fleet: units } };
		var newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

		// update base planet
		var baseArmy = Game.Unit.getArmy(basePlanet.armyId);
		if (!baseArmy) {
			basePlanet.armyId = null;	
		}
		basePlanet.timeRespawn = timeCurrent + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
		Game.Planets.update(basePlanet);

		// send ship
		var shipOptions = {
			startPosition:  startPosition,
			startPlanetId:  basePlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.SHIP,
			targetId:       enemyShip._id,
			startTime:      timeCurrent,
			flyTime:        timeAttack,
			isHumans:       true,
			engineLevel:    engineLevel,
			mission:        null,
			armyId:         newArmyId
		}

		Game.SpaceEvents.sendShip(shipOptions);
	}

})

Meteor.publish('spaceEvents', function () {
	if (this.userId) {
		return Game.SpaceEvents.Collection.find({
			user_id: this.userId,
			status: Game.SpaceEvents.status.STARTED
		})
	}
});

}