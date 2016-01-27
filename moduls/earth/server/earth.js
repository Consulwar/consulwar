initEarthServer = function() {

initEarthLib();
initEarthServerImport();

Game.Earth.addReinforcement = function(units) {
	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	var currentUnits = currentZone.userArmy;

	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {

				var count = parseInt( units[side][group][name], 10 );

				if (count <= 0) {
					continue;
				}

				if (!currentUnits) {
					currentUnits = {};
				}
				if (!currentUnits[side]) {
					currentUnits[side] = {};
				}
				if (!currentUnits[side][group]) {
					currentUnits[side][group] = {};
				}
				if (!currentUnits[side][group][name]) {
					currentUnits[side][group][name] = 0;
				}

				currentUnits[side][group][name] += count;
			}
		}
	}

	Game.EarthZones.Collection.update({
		isCurrent: true
	}, {
		$set: { userArmy: currentUnits }
	});
}

Game.Earth.countActivePlayers = function() {
	return Meteor.users.find({
		'status.lastLogin.date': {
			$gt: new Date((new Date()).setDate((new Date()).getDate() - 3))
		},
		'rating': {
			$gt: 24999
		}
	}).count();
}

Game.Earth.generateEnemyArmy = function(level) {
	// count online players
	var players = Game.Earth.countActivePlayers();

	if (players < Meteor.settings.earth.minActivePlayers) {
		players = Meteor.settings.earth.minActivePlayers;
	}

	// count difficulty modifier
	var difficulty = Math.pow(1.5, level);

	// generate units
	return {
		reptiles: {
			ground: {
				striker: Math.floor( 1000 * players * difficulty ),
				ripper: Math.floor( 900 * players * difficulty ),
				horror: Math.floor( 10 * players * difficulty ),
				slider: Math.floor( 8 * players * difficulty ),
				breaker: Math.floor( 12 * players * difficulty ),
				crusher: Math.floor( 1 * players * difficulty ),
				geccon: Math.floor( 3 * players * difficulty ),
				amfizben: Math.floor( 20 * players * difficulty ),
				amphibian: Math.floor( 14 * players * difficulty ),
				chipping: Math.floor( 1 * players * difficulty )
			}
		}
	};
}

Game.Earth.observeZone = function(name) {
	if (!Game.Mutual.has('research', 'reccons')) {
		throw new Meteor.Error('Нельзя разведать точки, еноты не изучены');
	}

	if (Game.Earth.countActivePlayers() < Meteor.settings.earth.minActivePlayers) {
		throw new Meteor.Error('Нельзя разведать точки, мало активных игроков');
	}

	// get target zone
	var zone = Game.EarthZones.Collection.findOne({
		name: name
	});

	if (!zone) {
		throw new Meteor.Error('Точка с именем ' + name + ' не найдена');
	}

	if (!zone.links || zone.links.length == 0) {
		throw new Meteor.Error('Точка с именем ' + name + ' не связана ни с одной зоной');
	}

	// get near zones
	var zonesAround = Game.EarthZones.Collection.find({
		name: { $in: zone.links },
		isVisible: { $ne: true }
	}).fetch();

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
}

Game.Earth.performBattleAtZone = function(name, options) {
	var zone = Game.EarthZones.Collection.findOne({
		name: name
	});

	if (!zone) {
		throw new Meteor.Error('Зона с именем ' + name + ' не найдена');
	}

	if (!zone.userArmy && !zone.enemyArmy) {
		return null; // No need to fight!
	}

	var battleResult = Game.Unit.performBattle(
		zone.userArmy,
		zone.enemyArmy,
		options
	);

	var turnResult = null;

	if (battleResult.userArmy) {
		if (battleResult.enemyArmy) {
			turnResult = 'tie';
		} else {
			turnResult = 'victory';
		}
	} else {
		turnResult = 'defeat';
	}

	// update zone
	var isEnemy = zone.isEnemy;
	if (isEnemy) {
		isEnemy = (turnResult == 'victory') ? false : true;
	} else {
		isEnemy = (turnResult == 'defeat') ? true : false;
	}

	Game.EarthZones.Collection.update({
		name: name
	}, {
		$set: {
			userArmy: battleResult.userArmy,
			enemyArmy: battleResult.enemyArmy,
			isEnemy: isEnemy
		}
	});

	if (turnResult == 'victory') {
		Game.Earth.observeZone(name);
	}
	
	if (turnResult == 'defeat') {
		Game.Earth.retreat();
	}

	return turnResult;
}

Game.Earth.moveArmy = function(destination) {
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

	// not movable units
	var stationaryUnits = [
		'army.ground.relax'
	];

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

					if (stationaryUnits.indexOf(side + '.' + group + '.' + name) >= 0) {
						// stay on current point
						if (!restArmy) {
							restArmy = {};
						}
						if (!restArmy[side]) {
							restArmy[side] = {};
						}
						if (!restArmy[side][group]) {
							restArmy[side][group] = {};
						}

						restArmy[side][group].name = count;

					} else {
						// move
						if (!destArmy) {
							destArmy = {};
						}
						if (!destArmy[side]) {
							destArmy[side] = {};
						}
						if (!destArmy[side][group]) {
							destArmy[side][group] = {};
						}
						if (!destArmy[side][group][name]) {
							destArmy[side][group][name] = 0;
						}

						destArmy[side][group][name] += count;
					}

				}
			}
		}
	}

	// update current zone
	Game.EarthZones.Collection.update({
		name: currentZone.name
	}, {
		$set: {
			isCurrent: false,
			userArmy: restArmy
		}
	});

	// update destination zone
	Game.EarthZones.Collection.update({
		name: destZone.name
	}, {
		$set: {
			isCurrent: true,
			userArmy: destArmy
		}
	});
}

Game.Earth.retreat = function() {
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

	// move army
	if (retreatZone) {
		Game.Earth.moveArmy(currentZone.name, retreatZone.name);
	}

	// destroy rest army
	Game.EarthZones.Collection.update({
		name: currentZone.name
	}, {
		$set: { userArmy: null }
	});

	// if no retreat zone, make first found user zone current
	if (!retreatZone) {
		Game.EarthZones.Collection.update({
			isVisible: true,
			isEnemy: { $ne: true }
		}, {
			$set: {
				isCurrent: true
			}
		});
	}
}

Game.Earth.nextTurn = function() {
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
		 && Game.Earth.countActivePlayers() >= Meteor.settings.earth.minActivePlayers
		) {
			Game.Earth.observeZone(currentZone.name);
			Game.Earth.createTurn();
		}

	} else {

		// There are enemy zones, perform turn
		if (Game.EarthTurns.getLast()) {
			Game.Earth.checkTurn();
		} else {
			Game.Earth.createTurn();
		}

	}
}

Game.Earth.createTurn = function() {
	var currentZone = Game.EarthZones.Collection.findOne({
		isCurrent: true
	});

	if (!currentZone) {
		throw new Meteor.Error('Не установлена текущая зона');
	}

	// create turn
	if (currentZone.enemyArmy) {

		// Got enemy at current zone! Proceed battle or retreat?
		var options = {
			type: 'battle',
			timeStart: Math.floor(new Date().valueOf() / 1000),
			actions: {
				battle: 0,
				retreat: 0
			},
			totalVotePower: 0,
			users: []
		};

	} else {

		// No enemy at current zone! What we gonna do?
		var zonesAround = Game.EarthZones.Collection.find({
			name: { $in: currentZone.links },
			isVisible: { $ne: false }
		}).fetch();

		var actionsList = {};
		actionsList[ currentZone.name ] = 0;

		for (var i = 0; i < zonesAround.length; i++) {
			actionsList[ zonesAround[i].name ] = 0;
		}

		var options = {
			type: 'move',
			timeStart: Math.floor(new Date().valueOf() / 1000),
			actions: actionsList,
			totalVotePower: 0,
			users: []
		};

	}

	// Save turn
	if (options) {
		Game.EarthTurns.Collection.insert(options);
	}
}

Game.Earth.checkTurn = function() {
	var lastTurn = Game.EarthTurns.getLast();

	if (!lastTurn) {
		throw new Meteor.Error('Не создано ни одного хода');
	}

	var turnResult = null;

	if (lastTurn.type == 'move') {

		var targetName = null;
		for (var name in lastTurn.actions) {
			if (targetName == null || lastTurn.actions[name] > lastTurn.actions[targetName]) {
				targetName = name;
			}
		}

		var currentZone = Game.EarthZones.Collection.findOne({
			isCurrent: true
		});

		if (currentZone.name != targetName) {

			// Move army and perform battle
			Game.Earth.moveArmy(targetName);
			turnResult = Game.Earth.performBattleAtZone(targetName);

		} else {

			// Stay at current zone
			// Enemy can attack (chance 1/3)
			if (Game.Random.interval(1, 99) <= 33) {

				// find near enemy zone
				var nearZone = Game.EarthZones.Collection.findOne({
					name: { $in: currentZone.links },
					isVisible: true,
					isEnemy: true,
					userArmy: null,
					enemyArmy: { $ne: null }
				});

				// get 10 - 50 % of enemy army
				var attackArmy = null;

				if (nearZone) {
					var k = Game.Random.interval(10, 50) / 100;
					var enemyArmy = nearZone.enemyArmy;
					
					for (var side in enemyArmy) {
						for (var group in enemyArmy[side]) {
							for (var name in enemyArmy[side][group]) {
								// skip reptiles groun chipping
								if (side == 'reptiles'
								 && group == 'ground'
								 && name == 'chipping'
								) {
									continue;
								}

								var count = parseInt( enemyArmy[side][group][name], 10 );
								count = Math.floor( count * k );

								if (count <= 0) {
									continue;
								}

								if (!attackArmy) {
									attackArmy = {};
								}
								if (!attackArmy[side]) {
									attackArmy[side] = {};
								}
								if (!attackArmy[side][group]) {
									attackArmy[side][group] = {};
								}

								attackArmy[side][group][name] = count;
							}
						}
					}	
				}

				// attack
				if (attackArmy) {
					Game.EarthZones.Collection.update({
						name: currentZone.name
					}, {
						$set: { enemyArmy: attackArmy }
					});

					turnResult = Game.Earth.performBattleAtZone(currentZone.name);
				}
			}
		}
	} else {

		// Retreat or fight?
		if (lastTurn.actions.battle > lastTurn.actions.retreat) {
			var currentZone = Game.EarthZones.Collection.findOne({
				isCurrent: true
			});
			turnResult = Game.Earth.performBattleAtZone(currentZone.name);
		} else {
			Game.Earth.retreat();
			turnResult = 'retreat';
		}

	}

	// Save turn result
	if (!turnResult) {
		turnResult = 'idle';
	}

	Game.EarthTurns.Collection.update({
		_id: lastTurn._id
	}, {
		$set: { result: turnResult }
	});

	// Create next turn
	Game.Earth.createTurn();
}

SyncedCron.add({
	name: 'Следующий ход битвы на земле',
	schedule: function(parser) {
		return parser.text('at 7:00pm every 1 day');
	},
	job: function() {
		Game.Earth.nextTurn();
	}
});

SyncedCron.start();

Meteor.publish('zones', function () {
	if (this.userId) {
		return Game.EarthZones.Collection.find();
	}
});

Meteor.publish('turns', function() {
	return Game.EarthTurns.Collection.find()
});

initEarthServerMethods();

}