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

	var currentUnits = (currentZone.userArmy) ? currentZone.userArmy : {};

	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {

				var count = parseInt( units[side][group][name], 10 );

				if (count <= 0) {
					continue;
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

Game.Earth.generateEnemyArmy = function() {
	// TODO: Write correct implementation!
	return {
		reptiles: {
			ground: {
				striker: Game.Random.interval(1000, 2000),
				ripper: Game.Random.interval(900, 1800),
				horror: Game.Random.interval(10, 20),
				slider: Game.Random.interval(8, 16),
				breaker: Game.Random.interval(12, 24),
				crusher: Game.Random.interval(1, 2),
				geccon: Game.Random.interval(3, 6),
				amfizben: Game.Random.interval(20, 40),
				amphibian: Game.Random.interval(14, 28),
				chipping: Game.Random.interval(1, 2)
			}
		}
	};
}

Game.Earth.observeZone = function(name) {
	if (!Game.Mutual.has('research', 'reccons')) {
		throw new Meteor.Error('Нельзя разведать точки, еноты не изучены');
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

	for (var i = 0; i < zonesAround.length; i++) {
		Game.EarthZones.Collection.update({
			name: zonesAround[i].name
		}, {
			$set: {
				isVisible: true,
				isEnemy: true,
				enemyArmy: Game.Earth.generateEnemyArmy()
			}
		});
	}
}

var checkHasAliveUnits = function(units) {
	for (var side in units) {
		for (var group in units[side]) {
			for (var name in units[side][group]) {
				if (units[side][group][name] > 0) {
					return true;
				}
			}
		}
	}
	return false;
}

Game.Earth.performBattleAtZone = function(name, options) {
	var zone = Game.EarthZones.Collection.findOne({
		name: name
	});

	if (!zone) {
		throw new Meteor.Error('Зона с именем ' + name + ' не найдена');
	}

	if (!zone.userArmy
	 && !zone.enemyArmy
	 && !checkHasAliveUnits( zone.userArmy )
	 && !checkHasAliveUnits( zone.enemyArmy )
	) {
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
	var currentArmy = (currentZone.userArmy) ? currentZone.userArmy : {};
	var destArmy = (destZone.userArmy) ? destZone.userArmy : {};
	var restArmy = {};

	for (var side in currentArmy) {
		for (var group in currentArmy[side]) {
			for (var name in currentArmy[side][group]) {

				var count = parseInt( currentArmy[side][group][name], 10 );

				if (count <= 0) {
					continue;
				}

				if (stationaryUnits.indexOf(side + '.' + group + '.' + name) >= 0) {
					// stay on current point
					if (!restArmy[side]) {
						restArmy[side] = {};
					}
					if (!restArmy[side][group]) {
						restArmy[side][group] = {};
					}

					restArmy[side][group].name = count;

				} else {
					// move
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
		name: { $in: zone.links },
		isVisible: { $ne: true },
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
		$set: { userArmy: {} }
	});

	// if no retreat zone, make first found user zone current
	if (!retreatZone) {
		Game.EarthZones.Collection.update({
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
		if (Game.Mutual.has('research', 'reccons')) {
			Game.Earth.observeZone(currentZone.name);
			Game.Earth.createTurn();
		} else {
			console.log('Need mutual research recons!');
		}

	} else {

		// There are enemy zones, perform turn
		Game.Earth.checkTurn();

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
	var finishDate = new Date();
	finishDate.setDate(new Date().getDate() + 1);
	finishDate.setHours(18);
	finishDate.setMinutes(55);
	finishDate.setSeconds(0);

	if (checkHasAliveUnits(currentZone.enemyArmy)) {

		// Got enemy at current zone! Proceed battle or retreat?
		var options = {
			type: 'battle',
			timeStart: Math.floor(new Date().valueOf() / 1000),
			timeFinish: Math.floor(finishDate.valueOf() / 1000),
			actions: {
				battle: 0,
				retreat: 0
			},
			users: []
		};

	} else {

		// No enemy at current zone! What we gonna do?
		var zonesAround = Game.EarthZones.Collection.find({
			name: { $in: currentZone.links },
			isVisible: { $ne: true }
		}).fetch();

		var actionsList = {};
		actionsList[ currentZone.name ] = 0;

		for (var i = 0; i < zonesAround.length; i++) {
			actionsList[ zonesAround[i].name ] = 0;
		}

		var options = {
			type: 'move',
			timeStart: Math.floor(new Date().valueOf() / 1000),
			timeFinish: Math.floor(finishDate.valueOf() / 1000),
			actions: actionsList,
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
		for (var targetName in lastTurn.actions) {
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

				// TODO: Get enemy army at near point! (exclude reptiles.ground.chipping unit)
				var enemyArmy = {
					reptiles: {
						ground: {
							striker: Game.Random.interval(100, 200),
							ripper: Game.Random.interval(50, 100),
							horror: Game.Random.interval(5, 10),
							slider: Game.Random.interval(2, 4)
						}
					}
				}

				if (enemyArmy) {
					Game.EarthZones.update({
						name: currentZone.name
					}, {
						$set: { enemyArmy: enemyArmy }
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

/* TODO: Enable after test!
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
*/

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