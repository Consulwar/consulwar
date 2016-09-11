initEarthServer = function() {

// ----------------------------------------------------------------------------
// Для ипморта точек (когда база пустая) нужно вызвать команду в консоли
// Meteor.call('earth.importZones')
//
// Для просчета следующего хода битвы на земле команда
// Meteor.call('earth.nextTurn')
//
// Остальные отладочные команды смотри в конце файла
// moduls/earth/server/methods.js
// ----------------------------------------------------------------------------

initEarthLib();
initEarthConfigServer();
initEarthServerImport();

// Auto import on server start
// If db.zones is empty
if (Game.EarthZones.Collection.find().count() === 0) {
	Game.Earth.importZones();
}

var checkIsStationaryUnit = function(side, group, name) {
	return[
		'army.ground.relax',
		'reptiles.ground.chipping'
	].indexOf(side + '.' + group + '.' + name) != -1;
};

var setupUnitHierarchy = function(units, side, group, name) {
	if (!units) {
		units = {};
	}
	if (!units[side]) {
		units[side] = {};
	}
	if (!units[side][group]) {
		units[side][group] = {};
	}
	if (!units[side][group][name]) {
		units[side][group][name] = 0;
	}
	return units;
};

Game.Earth.addReinforcement = function(units) {
	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	var honor = 0;
	var inc = {};
	var stats = {};
	stats['reinforcements.arrived.total'] = 0;

	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {
				var count = parseInt( units[side][group][name], 10 );
				if (count > 0) {
					honor += Game.Resources.calculateHonorFromReinforcement(
						Game.Unit.items[side][group][name].price(count)
					);
					inc['userArmy' + '.' + side + '.' + group + '.' + name ] = count;
					stats['reinforcements.arrived.' + side + '.' + group + '.' + name] = count;
					stats['reinforcements.arrived.total'] += count;
				}
			}
		}
	}
	
	if (stats['reinforcements.arrived.total'] > 0) {
		Game.Statistic.incrementUser(Meteor.userId(), stats);

		Game.Resources.add({
			honor: honor
		});

		Game.EarthZones.Collection.update({
			isCurrent: true
		}, {
			$inc: inc
		});
	}
};

Game.Earth.countActivePlayers = function() {
	return Meteor.users.find({
		'status.lastLogin.date': {
			$gt: new Date((new Date()).setDate((new Date()).getDate() - 3))
		},
		'rating': {
			$gt: 24999
		}
	}).count();
};

Game.Earth.generateEnemyArmy = function(level) {
	// count online players
	var players = Game.Earth.countActivePlayers();

	if (players < Game.Earth.MIN_ACTIVE_PLAYERS) {
		players = Game.Earth.MIN_ACTIVE_PLAYERS;
	}

	// count difficulty modifier
	var difficulty = Math.pow(1.5, level);

	var enemies = {
		reptiles: {
			ground: {}
		}
	};

	for (var name in Game.Earth.SPAWN) {
		enemies.reptiles.ground[name] = Math.floor(
			Game.Earth.SPAWN[name] * players * difficulty * Game.Earth.SPAWN_COEFFICIENT
		);
	}
	// generate units
	return enemies;
};

Game.Earth.observeZone = function(name) {
	console.log('Observe zone ' + name);

	// get target zone
	var zone = Game.EarthZones.Collection.findOne({
		name: name
	});

	if (!zone) {
		throw new Meteor.Error('Точка с именем ' + name + ' не найдена');
	}

	if (!zone.links || zone.links.length === 0) {
		throw new Meteor.Error('Точка с именем ' + name + ' не связана ни с одной зоной');
	}

	// get near zones
	var zonesAround = Game.EarthZones.Collection.find({
		name: { $in: zone.links },
		isVisible: { $ne: true }
	}).fetch();

	console.log('New zones: ', zonesAround);

	// calculate difficulty level
	var visibleZones = Game.EarthZones.Collection.find({
		isVisible: true
	}).count();

	visibleZones += zonesAround.length;
	
	var level = Math.round(visibleZones / 5); // each 5 visible zones = 1 difficulty level
	if (level < 1) {
		level = 1; // min level
	} else if (level > 8) {
		level = 8; // max level
	}

	// mark as visible + generate enemy army at each new zone
	for (var i = 0; i < zonesAround.length; i++) {
		Game.EarthZones.Collection.update({
			name: zonesAround[i].name
		}, {
			$set: {
				isVisible: true,
				isEnemy: true,
				enemyArmy: Game.Earth.generateEnemyArmy(level)
			}
		});
	}
};

Game.Earth.performBattleAtZone = function(name, options) {
	console.log('Perform battle at ' + name);

	var zone = Game.EarthZones.Collection.findOne({
		name: name
	});

	if (!zone) {
		throw new Meteor.Error('Зона с именем ' + name + ' не найдена');
	}

	if (!zone.enemyArmy) {
		console.log('No enemy army, then no need to fight');
		return null; // No need to fight!
	}

	options.damageReduction = Game.Earth.DAMAGE_REDUCTION;

	var battleResult = Game.Unit.performBattle(
		zone.userArmy,
		zone.enemyArmy,
		options
	);

	var result = null;

	if (battleResult.userArmy) {
		if (battleResult.enemyArmy) {
			result = 'tie';
		} else {
			result = 'victory';
		}
	} else {
		result = 'defeat';
	}

	// update zone
	var isEnemy = zone.isEnemy;
	if (isEnemy) {
		isEnemy = (result == 'victory') ? false : true;
	} else {
		isEnemy = (result == 'defeat') ? true : false;
	}

	var update = {
		$set: {
			isEnemy: isEnemy
		}
	};

	if (battleResult.userArmy) {
		update.$set.userArmy = battleResult.userArmy;
	} else {
		if (!update.$unset) {
			update.$unset = {};
		}
		update.$unset.userArmy = 1;
	}

	if (battleResult.enemyArmy) {
		update.$set.enemyArmy = battleResult.enemyArmy;
	} else {
		if (!update.$unset) {
			update.$unset = {};
		}
		update.$unset.enemyArmy = 1;
	}

	Game.EarthZones.Collection.update({ name: name }, update);

	if (result == 'victory') {
		Game.Earth.observeZone(name);
	}
	
	if (result == 'defeat') {
		Game.Earth.retreat();
	}

	console.log('Battle result: ' + result);
	return result;
};

Game.Earth.setCurrentZone = function(name) {
	console.log('Set ' + name + ' as current zone');

	Game.EarthZones.Collection.update({
		isCurrent: true
	}, {
		$set: {
			isCurrent: false
		}
	});

	Game.EarthZones.Collection.update({
		name: name
	}, {
		$set: {
			isCurrent: true
		}
	});
};

Game.Earth.moveArmy = function(destination) {
	console.log('Move user army to ' + destination);

	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	var destZone = Game.EarthZones.Collection.findOne({
		name: destination
	});

	if (!destZone) {
		throw new Meteor.Error('Зона с именем ' + destination + ' не найдена');
	}

	// check zones connected
	if (!currentZone.links
	 ||  currentZone.links.indexOf(destZone.name) < 0
	 || !destZone.links
	 ||  destZone.links.indexOf(currentZone.name) < 0
	) {
		throw new Meteor.Error('Зона ' + currentZone.name + ' не связана с зоной ' + destZone.name);
	}

	// move units
	var currentArmy = currentZone.userArmy;
	var destArmy = destZone.userArmy;
	var restArmy = null;

	if (currentArmy) {
		for (var side in currentArmy) {
			for (var group in currentArmy[side]) {
				for (var name in currentArmy[side][group]) {

					var count = parseInt( currentArmy[side][group][name], 10 );

					if (count <= 0) {
						continue;
					}

					if (checkIsStationaryUnit(side, group, name)) {
						// stay on current point
						restArmy = setupUnitHierarchy(restArmy, side, group, name);
						restArmy[side][group][name] = count;
					} else {
						// move
						destArmy = setupUnitHierarchy(destArmy, side, group, name);
						destArmy[side][group][name] += count;
					}

				}
			}
		}
	}

	if (destArmy) {
		// update army at current zone
		if (restArmy) {
			Game.EarthZones.Collection.update({
				name: currentZone.name
			}, {
				$set: {
					userArmy: restArmy
				}
			});
		} else {
			Game.EarthZones.Collection.update({
				name: currentZone.name
			}, {
				$unset: {
					userArmy: 1
				}
			});
		}

		// update army at destination zone
		Game.EarthZones.Collection.update({
			name: destZone.name
		}, {
			$set: {
				userArmy: destArmy
			}
		});
	}

	console.log('Moved army: ', destArmy);
	return destArmy;
};

Game.Earth.retreat = function() {
	console.log('Retreat!');

	// get current zone
	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	// get zone for retreat
	var retreatZone = Game.EarthZones.Collection.findOne({
		name: { $in: currentZone.links },
		isVisible: true,
		isEnemy: { $ne: true }
	});

	var movedArmy = null;

	if (retreatZone) {
		// try to move army
		movedArmy = Game.Earth.moveArmy(retreatZone.name);
		Game.Earth.setCurrentZone(retreatZone.name);
	} else {
		// if no retreat zone, make first found user zone current
		var emptyZone = Game.EarthZones.Collection.findOne({
			isVisible: true,
			isEnemy: { $ne: true }
		});
		Game.Earth.setCurrentZone(emptyZone.name);
	}

	// destroy rest army
	Game.EarthZones.Collection.update({
		name: currentZone.name
	}, {
		$set: { isEnemy: true },
		$unset: { userArmy: 1 }
	});

	return movedArmy;
};

Game.Earth.nextTurn = function() {
	console.log('-------- Earth next turn start --------');

	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Текущая зона не установлена');
	}

	var enemyZonesCount = Game.EarthZones.Collection.find({
		isEnemy: true,
		isVisible: true
	}).count();

	if (!currentZone.isEnemy && enemyZonesCount <= 0) {

		// Only start zone is available, so try to observer nearby zones
		if (Game.Mutual.has('research', 'reccons')
		 && Game.Earth.countActivePlayers() >= Game.Earth.MIN_ACTIVE_PLAYERS
		) {
			Game.Earth.observeZone(currentZone.name);
			Game.Earth.createTurn();
		} else {
			console.log('Unacceptable conditions!');
			console.log('Active players ' + Game.Earth.countActivePlayers() + ' of ' + Game.Earth.MIN_ACTIVE_PLAYERS);
			console.log('Mutual research is ' + Game.Mutual.has('research', 'reccons'));
		}

	} else {

		// There are enemy zones, perform turn
		if (Game.EarthTurns.getLast()) {
			Game.Earth.checkTurn();
		} else {
			Game.Earth.createTurn();
		}

	}

	console.log('-------- Earth next turn end ----------');
};

Game.Earth.createTurn = function() {
	console.log('Create next turn');

	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	// create turn
	var options = null;

	if (currentZone.enemyArmy) {

		// Got enemy at current zone! Proceed battle or retreat?
		console.log('Got enemy at current zone! Retreat or fight?');

		options = {
			type: 'battle',
			timeStart: Game.getCurrentTime(),
			actions: {
				battle: 0,
				retreat: 0
			},
			totalVotePower: 0,
			users: []
		};

	} else {

		// No enemy at current zone! What we gonna do?
		console.log('No enemy at current zone! Move or wait?');

		var zonesAround = Game.EarthZones.Collection.find({
			name: { $in: currentZone.links },
			isVisible: { $ne: false }
		}).fetch();

		var actionsList = {};
		actionsList[ currentZone.name ] = 0;

		for (var i = 0; i < zonesAround.length; i++) {
			actionsList[ zonesAround[i].name ] = 0;
		}

		options = {
			type: 'move',
			timeStart: Game.getCurrentTime(),
			actions: actionsList,
			totalVotePower: 0,
			users: []
		};

	}

	// Save turn
	if (options) {
		Game.EarthTurns.Collection.insert(options);
	}
};

Game.Earth.checkTurn = function() {
	console.log('Check current turn');

	var lastTurn = Game.EarthTurns.getLast();

	if (!lastTurn) {
		throw new Meteor.Error('Не создано ни одного хода');
	}

	var battleResult = null;
	var turnResult = null;
	var movedArmy = null;
	var battleOptions = null;

	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (lastTurn.type == 'move') {

		var targetName = null;
		for (var zoneName in lastTurn.actions) {
			if (targetName === null || lastTurn.actions[zoneName] > lastTurn.actions[targetName]) {
				targetName = zoneName;
			}
		}

		// try to move army
		movedArmy = (currentZone.name != targetName)
			? Game.Earth.moveArmy(targetName)
			: null;

		if (movedArmy) {

			console.log('Consuls decided to move');

			// Move and try to perform battle
			Game.Earth.setCurrentZone(targetName);
			turnResult = 'move';

			battleOptions = {
				isEarth: true,
				moveType: turnResult,
				location: targetName,
				userLocation: currentZone.name,
				enemyLocation: targetName
			};

			battleResult = Game.Earth.performBattleAtZone(targetName, battleOptions);

			// no battle, then save additional history
			if (battleResult === null) {
				battleOptions.enemyLocation = null;
				Game.BattleHistory.add(
					movedArmy,
					null, // no enemy!
					battleOptions,
					null // no battle results!
				);
			}

		} else {

			console.log('Consuls decided to wait');

			// Stay at current zone
			// Enemy can attack (chance 1/3)
			var attackArmy = null;
			var nearZone = null;

			if (currentZone.name != 'South Africa' && Game.Random.interval(1, 99) <= 33) {
				// find near enemy zone
				nearZone = Game.EarthZones.Collection.findOne({
					name: { $in: currentZone.links },
					isVisible: true,
					isEnemy: true
				});

				// get 10 - 50 % of enemy army
				if (nearZone) {
					var k = Game.Random.interval(10, 50) / 100;
					var enemyArmy = nearZone.enemyArmy;
					
					for (var side in enemyArmy) {
						for (var group in enemyArmy[side]) {
							for (var name in enemyArmy[side][group]) {
								// skip stationary units
								if (checkIsStationaryUnit(side, group, name)) {
									continue;
								}

								var count = parseInt( enemyArmy[side][group][name], 10 );
								count = Math.floor( count * k );

								if (count <= 0) {
									continue;
								}

								attackArmy = setupUnitHierarchy(attackArmy, side, group, name);
								attackArmy[side][group][name] = count;
							}
						}
					}	
				}
			}

			if (attackArmy) {
				// attack
				console.log('But enemy attacked!');
				turnResult = 'defend';

				battleOptions = {
					isEarth: true,
					moveType: turnResult,
					location: currentZone.name,
					userLocation: currentZone.name,
					enemyLocation: (nearZone ? nearZone.name : null)
				};

				Game.EarthZones.Collection.update({
					name: currentZone.name
				}, {
					$set: { enemyArmy: attackArmy }
				});

				battleResult = Game.Earth.performBattleAtZone(currentZone.name, battleOptions);
			} else {
				// no battle
				console.log('And nothing happened');
				turnResult = 'wait';

				// save additional history
				Game.BattleHistory.add(
					currentZone.userArmy,
					null, // no enemy!
					{
						isEarth: true,
						moveType: turnResult,
						location: currentZone.name,
						userLocation: currentZone.name
					},
					null // no battle results!
				);
			}
		}

	} else {

		// Retreat or fight?
		if (lastTurn.actions.battle > lastTurn.actions.retreat) {
			// fight
			console.log('Consuls decided to fight');
			turnResult = 'fight';

			battleOptions = {
				isEarth: true,
				moveType: turnResult,
				location: currentZone.name,
				userLocation: currentZone.name,
				enemyLocation: currentZone.name
			};

			battleResult = Game.Earth.performBattleAtZone(currentZone.name, battleOptions);
		} else {
			// retreat
			console.log('Consuls decided to retreat');
			movedArmy = Game.Earth.retreat();
			turnResult = 'retreat';

			// no battle, then save additional history
			Game.BattleHistory.add(
				movedArmy,
				currentZone.enemyArmy,
				{
					isEarth: true,
					moveType: turnResult,
					location: currentZone.name,
					userLocation: currentZone.name,
					enemyLocation: currentZone.name
				},
				null // no battle results!
			);
		}

	}

	// Save turn result
	Game.EarthTurns.Collection.update({
		_id: lastTurn._id
	}, {
		$set: {
			turnResult: turnResult,
			battleResult: battleResult
		}
	});

	// Create next turn
	Game.Earth.createTurn();
};

SyncedCron.add({
	name: 'Следующий ход битвы на земле',
	schedule: function(parser) {
		return parser.text(Game.Earth.UPDATE_SCHEDULE);
	},
	job: function() {
		Game.Earth.nextTurn();
	}
});

Meteor.publish('zones', function () {
	if (this.userId) {
		return Game.EarthZones.Collection.find();
	}
});

Meteor.publish('turns', function() {
	return Game.EarthTurns.Collection.find();
});

initEarthServerMethods();

};