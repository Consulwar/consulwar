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
	// TODO: Придумать что делать со временем спавна
	//       сейчас все флоты появляются одновременно
	var timeLastTradeFleet = Game.Planets.getLastTradeFleetTime();
	if (timeCurrent >= timeLastTradeFleet + Game.Cosmos.TRADE_FLEET_PERIOD) {
		Game.SpaceEvents.actualizeTradeFleets();
		Game.Planets.setLastTradeFleetTime( timeCurrent );
	}
};

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
};

Game.SpaceEvents.add = function(event) {
	event.user_id = Meteor.userId();
	return Game.SpaceEvents.Collection.insert(event);
};

Game.SpaceEvents.complete = function(task) {
	if (!task) {
		return null;
	}

	var event = Game.SpaceEvents.Collection.findOne({
		_id: task.eventId,
		user_id: task.user_id
	});

	if (!event
	 || event.status == Game.SpaceEvents.status.FINISHED
	 || event.timeEnd > Game.getCurrentTime()
	) {
		return null;
	}

	var newTask = null;

	switch (event.type) {
		case Game.SpaceEvents.type.SHIP:
			newTask = Game.SpaceEvents.completeShip(event);
			break;
		case Game.SpaceEvents.type.REINFORCEMENT:
			newTask = Game.SpaceEvents.completeReinforcement(event);
			break;
		case Game.SpaceEvents.type.TRIGGER_ATTACK:
			newTask = Game.SpaceEvents.completeTriggerAttack(event);
			break;
	}
	
	event.status = Game.SpaceEvents.status.FINISHED;
	Game.SpaceEvents.Collection.update({ _id: event._id }, event);

	return newTask;
};

// ----------------------------------------------------------------------------
// Earth reinforcement events
// ----------------------------------------------------------------------------

Game.SpaceEvents.sendReinforcement = function(options) {
	// mandatory options
	if (options.startTime === undefined) {
		throw new Meteor.Error('Не задано время старта');
	}

	if (options.durationTime === undefined) {
		throw new Meteor.Error('Не задано время за которое прибудет подкрепление');
	}

	if (options.units === undefined) {
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
		return Game.Queue.add({
			type: 'spaceEvent',
			eventId: eventId,
			startTime: options.startTime,
			time: options.durationTime
		});
	}

	return null;
};

Game.SpaceEvents.completeReinforcement = function(event) {
	// kill random count on the way
	var killedPercent = Game.Random.interval(0, 30);
	event.info.killedPercent = killedPercent;
	var k = 1 - (killedPercent / 100);

	var units = event.info.units;
	var arrived = null;

	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {
				var count = parseInt( units[side][group][name], 10 );
				var result = Math.floor( count * k );
				// if result < 1, check chance instead of percents
				if (result < 1) {
					result = Game.Random.random() < k ? 1 : 0;
				}
				// save result
				if (result > 0) {
					if (!arrived) {
						arrived = {};
					}
					if (!arrived[side]) {
						arrived[side] = {};
					}
					if (!arrived[side][group]) {
						arrived[side][group] = {};
					}
					arrived[side][group][name] = result;
				}
			}
		}
	}

	// save reinforcements
	if (arrived) {
		Game.Earth.addReinforcement( arrived );
	}

	// reinforcements don't create new tasks
	return null;
};

// ----------------------------------------------------------------------------
// Trigger attack event
// ----------------------------------------------------------------------------

Game.SpaceEvents.addTriggerAttack = function(options) {
	// mandatory options
	if (options.startTime === undefined) {
		throw new Meteor.Error('Не задано время старта');
	}

	if (options.delayTime === undefined) {
		throw new Meteor.Error('Не задано время задержки');
	}

	if (options.targetPlanet === undefined) {
		throw new Meteor.Error('Не задана планета');
	}

	// add event
	var eventId = Game.SpaceEvents.add({
		type: Game.SpaceEvents.type.TRIGGER_ATTACK,
		status: Game.SpaceEvents.status.STARTED,
		timeStart: options.startTime,
		timeEnd: options.startTime + options.delayTime,
		info: {
			targetPlanet: options.targetPlanet
		}
	});

	// add task into queue
	if (eventId) {
		return Game.Queue.add({
			type: 'spaceEvent',
			eventId: eventId,
			startTime: options.startTime,
			time: options.delayTime
		});
	}

	return null;
};

Game.SpaceEvents.completeTriggerAttack = function(event) {
	var planet = Game.Planets.getOne(event.info.targetPlanet);
	if (!planet) {
		return null; // no such planet
	}

	if (planet.isHome || !planet.armyId) {
		return null; // no need to attack this planet
	}

	var reptilePlanets = Game.Planets.Collection.find({
		user_id: Meteor.userId(),
		mission: { $ne: null },
		segment: planet.segment,
		hand: planet.hand
	}).fetch();

	if (reptilePlanets.length === 0) {
		return null; // no reptiles at this sector
	}

	// generate appropriate mission and calculate health
	var mission = Game.Planets.generateMission(planet);

	var enemyFleet = Game.Battle.items[mission.type].level[mission.level].enemies;
	for (var name in enemyFleet) {
		enemyFleet[name] = Game.Unit.rollCount( enemyFleet[name] );
	}
	var enemyHealth = Game.Unit.calcUnitsHealth({
		reptiles: {
			fleet: enemyFleet
		}
	});

	var userArmy = Game.Unit.getArmy(planet.armyId);
	var userHealth = Game.Unit.calcUnitsHealth(userArmy.units);

	// check attack possibility
	if (userHealth > enemyHealth * 0.5 /* && Game.Random.random() > 0.35 */) {
		return null; // not this time
	}

	// find nearest planet
	var nearestPlanet = null;
	var minDistance = Number.MAX_VALUE;
	var curDistance = Number.MAX_VALUE;
	for (var i = 0; i < reptilePlanets.length; i++) {
		curDistance = Game.Planets.calcDistance(reptilePlanets[i], planet);
		if (!nearestPlanet || curDistance < minDistance) {
			nearestPlanet = reptilePlanets[i];
			minDistance = curDistance;
		}
	}

	// perform attack
	var startPosition = {
		x: nearestPlanet.x,
		y: nearestPlanet.y
	};

	var targetPosition = {
		x: planet.x,
		y: planet.y
	};

	return Game.SpaceEvents.sendShip({
		startPosition:  startPosition,
		startPlanetId:  nearestPlanet._id,
		targetPosition: targetPosition,
		targetType:     Game.SpaceEvents.target.PLANET,
		targetId:       planet._id,
		startTime:      event.timeEnd,
		flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, 1),
		isHumans:       false,
		isOneway:       false,
		engineLevel:    1,
		mission:        mission
	});
};

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

	if (options.hand === undefined) {
		options.hand = null;
	}

	if (options.segment === undefined) {
		options.segment = null;
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
			armyId: options.armyId,
			hand: options.hand,
			segment: options.segment
		}
	});

	// add task into queue
	if (eventId) {
		return Game.Queue.add({
			type: 'spaceEvent',
			eventId: eventId,
			startTime: options.startTime,
			time: options.flyTime
		});
	}
	
	return null;
};

Game.SpaceEvents.actualizeTradeFleets = function() {
	// find fleets and group by sector
	var fleets = Game.SpaceEvents.Collection.find({
		user_id: Meteor.userId(),
		type: Game.SpaceEvents.type.SHIP,
		timeEnd: { $gt: Game.getCurrentTime() },
		'info.mission.type': 'tradefleet'
	}).fetch();

	var i = 0;
	var fleetsBySector = {};
	for (i = 0; i < fleets.length; i++) {
		var fleet = fleets[i];
		if (!fleetsBySector[fleet.info.hand]) {
			fleetsBySector[fleet.info.hand] = [];
		}
		fleetsBySector[fleet.info.hand].push(fleet.info.segment);
	}

	// find occupied hands and sectors
	var occupied = {};
	var colonies = Game.Planets.getColonies();

	for (i = 0; i < colonies.length; i++) {
		var planet = colonies[i];
		if (!occupied[planet.hand]) {
			occupied[planet.hand] = [];
		}
		occupied[planet.hand].push(planet.segment);
	}

	// check each occupied hand
	for (var hand in occupied) {
		// aggregate and sort hand sectors
		var sectors = [];
		for (i = 0; i < occupied[hand].length; i++) {
			var segment = occupied[hand][i];
			if (sectors.indexOf(segment) == -1) {
				sectors.push(segment);
			}
			if (segment > 0 && sectors.indexOf(segment - 1) == -1) {
				sectors.push(segment - 1);
			}
			if (segment < 9 && sectors.indexOf(segment + 1) == -1) {
				sectors.push(segment + 1);
			}
		}

		sectors.sort(function(a, b) {
			return a - b;
		});

		// calculate intervals
		var intervals = [];
		var currentInterval = 0;

		intervals.push([ sectors[0] ]);

		for (i = 1; i < sectors.length; i++) {
			if (sectors[i] - sectors[i - 1] > 1) {
				currentInterval++;
				intervals[currentInterval] = [];
			}
			intervals[currentInterval].unshift(sectors[i]);
		}

		for (i = 0; i < intervals.length; i++) {
			var fleetsCount = Math.round( intervals[i].length / 3 );
			var sectorsCount = Math.ceil( intervals[i].length / fleetsCount );
			for (var k = 0; k < fleetsCount; k++) {
				var startInterval = intervals[i].slice(k * sectorsCount, (k + 1) * sectorsCount);

				// check existing fleet inside interval
				var hasFleet = false;
				for (var n = 0; n < startInterval.length; n++) {
					if (fleetsBySector[hand]
					 && fleetsBySector[hand].indexOf(startInterval[n]) != -1
					) {
						hasFleet = true;
						break;
					}
				}
				if (hasFleet) {
					continue; // skip this interval
				}

				// spawn trade fleet
				Game.SpaceEvents.spawnTradeFleet(
					parseInt( hand ),
					startInterval[ Game.Random.interval(0, startInterval.length - 1) ]
				);
			}
		}
	}
};

Game.SpaceEvents.spawnTradeFleet = function(hand, segment) {
	// find planets inside hand
	var finishPlanets = Game.Planets.Collection.find({
		user_id: Meteor.userId(),
		hand: hand,
		mission: { $ne: null }
	}).fetch();

	// save segment planets as start planets
	var n = finishPlanets.length;
	var startPlanets = [];
	while (n-- > 0) {
		if (finishPlanets[n].segment == segment) {
			startPlanets.push(finishPlanets[n]);
			finishPlanets.splice(n, 1);
		}
	}

	if (startPlanets.length > 0 && finishPlanets.length > 0) {
		// get two random planets
		var startPlanet = startPlanets[ Game.Random.interval(0, startPlanets.length - 1) ];
		var targetPlanet = finishPlanets[ Game.Random.interval(0, finishPlanets.length - 1) ];

		// send ship
		var timeCurrent = Game.getCurrentTime();

		var startPosition = {
			x: startPlanet.x,
			y: startPlanet.y
		};

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		};

		var mission = Game.Planets.generateMission(startPlanet);
		if (!mission) {
			mission = {
				level: Game.Random.interval(1, 10)
			};
		}
		mission.type = 'tradefleet';

		var engineLevel = 0;
		var flyTime = Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel);

		Game.SpaceEvents.sendShip({
			startPosition:  startPosition,
			startPlanetId:  startPlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      timeCurrent,
			flyTime:        flyTime,
			isHumans:       false,
			isOneway:       true,
			engineLevel:    engineLevel,
			mission:        mission,
			hand:           startPlanet.hand,
			segment:        startPlanet.segment
		});
	}
};

Game.SpaceEvents.makeFun = function() {
	if (Game.Planets.getLastFunTime() + Game.Cosmos.FUN_PERIOD > Game.getCurrentTime()) {
		return false;
	}

	Game.Planets.setLastFunTime( Game.getCurrentTime() );

	var mission = {
		type: 'battlefleet',
		level: 10
	};

	var colonies = Game.Planets.getColonies();
	for (var i = 0; i < colonies.length; i++) {
		var planet = colonies[i];
		var fleets = planet.isHome ? 3 : 1;
		for (var j = 0; j < fleets; j++) {
			Game.SpaceEvents.sendReptileFleetToPlanet(planet._id, mission);
		}
	}

	return true;
};

Game.SpaceEvents.sendReptileFleetToPlanet = function(planetId, mission) {
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
		};

		var targetPosition = {
			x: targetPlanet.x,
			y: targetPlanet.y
		};

		var engineLevel = 0;

		if (!mission) {
			mission = (targetPlanet.isHome)
				? Game.Planets.getReptileAttackMission()
				: Game.Planets.generateMission(targetPlanet);
		}

		if (!mission) {
			throw new Meteor.Error('Не получилось сгенерировать миссию для нападения');
		}

		Game.SpaceEvents.sendShip({
			startPosition:  startPosition,
			startPlanetId:  startPlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       targetPlanet._id,
			startTime:      timeCurrent,
			flyTime:        Game.Planets.calcFlyTime(startPosition, targetPosition, engineLevel),
			isHumans:       false,
			isOneway:       false,
			engineLevel:    engineLevel,
			mission:        mission
		});
	}
};

// ----------------------------------------------------------------------------
// Complete space ship travel
// ----------------------------------------------------------------------------

var completeHumansArrival = function(event, planet) {
	var newTask = null;
	var battleResult = null;
	var userArmy = null;
	var enemyArmy = null;

	if (planet.mission) {
		var userLocation = (event.info.startPlanetId)
			? event.info.startPlanetId
			: event.info.startPosition;

		var battleOptions = {
			timestamp: event.timeEnd,
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

		// add battle reward
		var reward = {};
		if (battleResult.reward) {
			_.extend(reward, battleResult.reward);
		}
		if (battleResult.artefacts) {
			_.extend(reward, battleResult.artefacts);
		}
		if (_.keys(reward).length > 0) {
			Game.Resources.add(reward);
		}
		// add battle cards
		if (battleResult.cards) {
			Game.Cards.add(battleResult.cards);
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
			// update artefacts time
			planet.timeArtefacts = event.timeEnd;
			// add reptiles attack trigger
			newTask = Game.SpaceEvents.addTriggerAttack({
				startTime: event.timeEnd,
				delayTime: Game.Cosmos.TRIGGER_ATTACK_DELAY,
				targetPlanet: planet._id
			});
		}
	} else if (!battleResult || userArmy) {
		// return ship
		newTask = Game.SpaceEvents.sendShip({
			startPosition:  event.info.targetPosition,
			startPlanetId:  event.info.targetId,
			targetPosition: event.info.startPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       event.info.startPlanetId,
			startTime:      event.timeEnd,
			flyTime:        Game.Planets.calcFlyTime(event.info.targetPosition, event.info.startPosition, event.info.engineLevel),
			isHumans:       true,
			isOneway:       true,
			engineLevel:    event.info.engineLevel,
			mission:        null,
			armyId:         event.info.armyId
		});
	}

	planet.timeRespawn = event.timeEnd + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
	Game.Planets.update(planet);

	if (!battleResult || (userArmy && !enemyArmy)) {
		if (!planet.isDiscovered) {
			Meteor.call('planet.discover', planet._id);
		}
	}

	return newTask;
};

var completeReptilesArrival = function(event, planet) {
	if (!event.info.mission) {
		return null; // empty reptiles ship!
	}

	var newTask = null;

	// get enemy fleet
	var enemyFleet = Game.SpaceEvents.getFleetUnits(event._id);
	var enemyArmy = (enemyFleet)
		? { reptiles: { fleet: enemyFleet } }
		: null;

	// define user army
	var userArmy = null;

	if (!planet.mission && (planet.armyId || planet.isHome)) {
		// reptiles attack our planet
		var enemyLocation = (event.info.startPlanetId)
			? event.info.startPlanetId
			: event.info.startPosition;

		var battleOptions = {
			timestamp: event.timeEnd,
			missionType: event.info.mission.type,
			missionLevel: event.info.mission.level,
			location: planet._id,
			userLocation: planet._id,
			enemyLocation: enemyLocation
		};
		
		// get user army
		var userArmyData = planet.isHome
			? Game.Unit.getHomeArmy()
			: Game.Unit.getArmy(planet.armyId);

		userArmy = (userArmyData) ? userArmyData.units : null;

		// save ground units
		var userArmyGround = null;
		if (userArmy && userArmy.army && userArmy.army.ground) {
			userArmyGround = userArmy.army.ground;
			delete userArmy.army.ground;
		}

		// perform battle
		var battleResult = Game.Unit.performBattle(userArmy, enemyArmy, battleOptions);
		userArmy = battleResult.userArmy;
		enemyArmy = battleResult.enemyArmy;

		// add battle reward
		var reward = {};
		if (battleResult.reward) {
			_.extend(reward, battleResult.reward);
		}
		if (battleResult.artefacts) {
			_.extend(reward, battleResult.artefacts);
		}
		if (_.keys(reward).length > 0) {
			Game.Resources.add(reward);
		}
		// add battle cards
		if (battleResult.cards) {
			Game.Cards.add(battleResult.cards);
		}

		// restore ground units
		if (userArmyGround) {
			if (!userArmy) {
				userArmy = { army: {} };
			}
			userArmy.army.ground = userArmyGround;
		}

		// update user army
		if (userArmyData) {
			if (userArmy) {
				Game.Unit.updateArmy(userArmyData._id, userArmy);
			} else {
				Game.Unit.removeArmy(userArmyData._id);
				if (!planet.isHome) {
					planet.armyId = null;
				}
			}
		}

		// update reptile army
		if (enemyArmy) {
			event.info.mission.units = enemyArmy.reptiles.fleet;
		} else {
			event.info.mission = null;
		}

		// after battle
		if (battleResult.result == Game.Battle.result.defeat) {
			// collect all gained artefacts until defeat
			if (!planet.isHome) {
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

			// steal user resources
			if (planet.isHome) {
				var userResources = Game.Resources.getValue();
				var stealCost = Game.Unit.calculateArmyCost(enemyArmy);
				var bunker = Game.Effect.Special.getValue(true, { engName: 'bunker' });

				for (var resName in stealCost) {
					var stealAmount = Math.floor(stealCost[resName] * 0.2); // 20%

					var userAmount = (userResources[resName] && userResources[resName].amount)
						? userResources[resName].amount
						: 0;

					// save some resources
					if (bunker && bunker[resName]) {
						if (bunker[resName] < userAmount) {
							userAmount -= bunker[resName];
						} else {
							userAmount = 0;
						}
					}

					if (stealAmount > userAmount) {
						stealCost[resName] = userAmount;
					} else {
						stealCost[resName] = stealAmount;
					}
				}

				Game.Resources.steal(stealCost);

				// save history
				if (battleResult) {
					Game.BattleHistory.set(battleResult.historyId, {
						lostResources: stealCost,
					});
				}
			}
		}
	}

	if (enemyArmy) {
		if (userArmy || planet.isHome || !event.info.isOneway) {
			// return reptiles ship
			newTask = Game.SpaceEvents.sendShip({
				startPosition:  event.info.targetPosition,
				startPlanetId:  event.info.targetId,
				targetPosition: event.info.startPosition,
				targetType:     Game.SpaceEvents.target.PLANET,
				targetId:       event.info.startPlanetId,
				startTime:      event.timeEnd,
				flyTime:        Game.Planets.calcFlyTime(event.info.targetPosition, event.info.startPosition, event.info.engineLevel),
				isHumans:       false,
				isOneway:       true,
				engineLevel:    event.info.engineLevel,
				mission:        event.info.mission,
				armyId:         null
			});
		} else {
			if (!planet.mission) {
				// fill empty planet
				planet.mission = {
					type: 'defencefleet',
					level: event.info.mission.level,
					units: event.info.mission.units
				};
			} else {
				// restore mission units
				planet.mission.units = null;
			}
		}
	}

	planet.timeRespawn = event.timeEnd + Game.Cosmos.ENEMY_RESPAWN_PERIOD;
	Game.Planets.update(planet);

	return newTask;
};

var completeShipFight = function(event) {
	var targetShip = Game.SpaceEvents.getOne(event.info.targetId);
	if (!targetShip) {
		throw new Meteor.Error('Корабль с id = ' + event.info.targetId + ' не существует');
	}

	if (event.info.isHumans == targetShip.info.isHumans) {
		throw new Meteor.Error('Невозможна битва между одной стороной конфликта');
	}

	var newTask = null;
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
			timestamp: event.timeEnd,
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

		// add battle reward
		if ((firstArmy && event.info.isHumans) || (secondArmy && targetShip.info.isHumans)) {
			var reward = {};
			if (battleResult.reward) {
				_.extend(reward, battleResult.reward);
			}
			if (battleResult.artefacts) {
				_.extend(reward, battleResult.artefacts);
			}
			if (_.keys(reward).length > 0) {
				Game.Resources.add(reward);
			}
			// add battle cards
			if (battleResult.cards) {
				Game.Cards.add(battleResult.cards);
			}
		}
	}

	// return to base
	if (isAlive) {
		newTask = Game.SpaceEvents.sendShip({
			startPosition:  event.info.targetPosition,
			startPlanetId:  null,
			targetPosition: event.info.startPosition,
			targetType:     Game.SpaceEvents.target.PLANET,
			targetId:       event.info.startPlanetId,
			startTime:      event.timeEnd,
			flyTime:        Game.Planets.calcFlyTime(event.info.targetPosition, event.info.startPosition, event.info.engineLevel),
			isHumans:       event.info.isHumans,
			engineLevel:    event.info.engineLevel,
			mission:        event.info.mission,
			armyId:         event.info.armyId
		});
	}

	return newTask;
};

Game.SpaceEvents.completeShip = function(event) {
	// Arrived to planet
	if (event.info.targetType ==  Game.SpaceEvents.target.PLANET) {
		var planetId = event.info.targetId;
		var planet = Game.Planets.getOne(planetId);

		if (!planet) {
			return null; // no such planet
		}

		if (event.info.isHumans) { 
			return completeHumansArrival(event, planet); // Humans arrived
		} else {
			return completeReptilesArrival(event, planet); // Reptiles arrived
		}
	}

	// Meet with target ship
	if (event.info.targetType == Game.SpaceEvents.target.SHIP) {
		return completeShipFight(event);
	}

	return null;
};

// ----------------------------------------------------------------------------
// Public methods
// ----------------------------------------------------------------------------

Meteor.methods({
	'spaceEvents.attackReptFleet': function(baseId, targetId, units, targetX, targetY) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('spaceEvents.attackReptFleet: ', new Date(), user.username);

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
		};

		var targetPosition = {
			x: targetX,
			y: targetY
		};

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
		Game.SpaceEvents.sendShip({
			startPosition:  startPosition,
			startPlanetId:  basePlanet._id,
			targetPosition: targetPosition,
			targetType:     Game.SpaceEvents.target.SHIP,
			targetId:       enemyShip._id,
			startTime:      timeCurrent,
			flyTime:        timeAttack,
			isHumans:       true,
			isOneway:       false,
			engineLevel:    engineLevel,
			mission:        null,
			armyId:         newArmyId
		});

		// save statistic
		Game.Statistic.incrementUser(user._id, {
			'cosmos.fleets.sent': 1
		});
	}
});

Meteor.publish('spaceEvents', function () {
	if (this.userId) {
		return Game.SpaceEvents.Collection.find({
			user_id: this.userId,
			status: Game.SpaceEvents.status.STARTED
		});
	}
});

};