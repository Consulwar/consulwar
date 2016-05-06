initUnitServer = function() {

initUnitLib();
initUnitServerMethods();

Game.Unit.Collection._ensureIndex({
	user_id: 1
});

Game.Unit.set = function(unit, invertSign, uid) {
	invertSign = invertSign === true ? -1 : 1;

	Game.Unit.initialize();

	var inc = {};
	inc['units.army.' + unit.group + '.' + unit.engName] = parseInt(unit.count * invertSign);

	Game.Unit.Collection.update({
		user_id: uid !== undefined ? uid : Meteor.userId(),
		location: Game.Unit.location.HOME
	}, {
		$inc: inc
	});

	return inc;
};

Game.Unit.add = function(unit, uid) {
	return Game.Unit.set(unit, false, uid);
};

Game.Unit.remove = function(unit, uid) {
	return Game.Unit.set(unit, true, uid);
};

Game.Unit.complete = function(task) {
	Game.Unit.add(task);
};

Game.Unit.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Unit.getHomeArmy();

	if (currentValue === undefined) {
		Game.Unit.Collection.insert({
			user_id: user._id,
			location: Game.Unit.location.HOME
		});
	}
};

Game.Unit.removeArmy = function(id) {
	if (Game.Unit.getHomeArmy()._id == id) {
		Game.Unit.Collection.update({ _id: id }, { $set: { 'units': {} } } );
	} else {
		Game.Unit.Collection.remove({ _id: id });
	}
};

Game.Unit.createArmy = function(units, location) {
	var record = {};

	record.user_id = Meteor.userId();
	record.units = units;
	record.location = location;

	return Game.Unit.Collection.insert(record);
};

Game.Unit.updateArmy = function(id, units) {
	var army = Game.Unit.getArmy(id);
	if (army) {
		army.units = units;
		Game.Unit.Collection.update({ _id: id }, army);
	}
};

Game.Unit.moveArmy = function (id, location) {
	var army = Game.Unit.getArmy(id);
	if (army) {
		army.location = location;
		Game.Unit.Collection.update({ _id: id }, army);
	}
};

Game.Unit.sliceArmy = function(sourceId, destUnits, destLocation) {
	if (destLocation == Game.Unit.location.HOME) {
		throw new Meteor.Error('Может существовать только одна локация HOME');
	}

	var source = Game.Unit.getArmy(sourceId);
	if (!source || !source.units) {
		throw new Meteor.Error('Нет армии с таким id');
	}

	var sourceUnits = source.units;
	var totalCount = 0;
	var restCount = 0;

	for (var side in sourceUnits) {
		for (var group in sourceUnits[side]) {
			for (var name in sourceUnits[side][group]) {
				// subtract destination units 
				if (destUnits[side]
				 && destUnits[side][group]
				 && destUnits[side][group][name]
				) {
					var count = parseInt( destUnits[side][group][name], 10 );
					if (count > sourceUnits[side][group][name]) {
						count = sourceUnits[side][group][name];
					}

					destUnits[side][group][name] = count;
					sourceUnits[side][group][name] -= count;
					totalCount += count;
				}
				
				// calculate rest units
				restCount += sourceUnits[side][group][name];
			}
		}
	}

	if (totalCount <= 0) {
		throw new Meteor.Error('Неправильные входные данные');
	}

	// update source
	if (restCount > 0) {
		Game.Unit.updateArmy(sourceId, sourceUnits);
	} else {
		Game.Unit.removeArmy(sourceId);
	}

	// insert new slice
	return Game.Unit.createArmy(destUnits, destLocation);
};

Game.Unit.mergeArmy = function(sourceId, destId) {
	if (sourceId == destId) {
		throw new Meteor.Error('Нельзя слить одну и туже армию');
	}

	var source = Game.Unit.getArmy(sourceId);
	var dest = Game.Unit.getArmy(destId);

	if (!source || !source.units || !dest || !dest.units) {
		throw new Meteor.Error('Армии с указанными id не найдены');
	}

	if (source.location == Game.Unit.location.HOME) {
		throw new Meteor.Error('Нельзя слить домашнюю армию');
	}

	var sourceUnits = source.units;
	var destUnits = dest.units;
	var mergeCount = 0;

	for (var side in sourceUnits) {
		for (var group in sourceUnits[side]) {
			for (var name in sourceUnits[side][group]) {

				var count = parseInt( sourceUnits[side][group][name], 10 );

				if (!destUnits[side]) {
					destUnits[side] = {};
				}
				if (!destUnits[side][group]) {
					destUnits[side][group] = {};
				}
				if (!destUnits[side][group][name]) {
					destUnits[side][group][name] = 0;
				}

				destUnits[side][group][name] += count;
				mergeCount += count;
			}
		}
	}

	// remove source
	Game.Unit.removeArmy(sourceId);

	// update destination units
	if (mergeCount > 0) {
		Game.Unit.updateArmy(destId, destUnits);
	}
};

Game.Unit.rollCount = function(name) {
	if (_.isNumber(name)) {
		return name;
	}

	switch (name) {
		case 'few':
			return Game.Random.interval(1, 4);
		case 'several':
			return Game.Random.interval(5, 9);
		case 'pack':
			return Game.Random.interval(10, 19);
		case 'lots':
			return Game.Random.interval(20, 49);
		case 'horde':
			return Game.Random.interval(50, 99);
		case 'throng':
			return Game.Random.interval(100, 249);
		case 'swarm':
			return Game.Random.interval(250, 499);
		case 'zounds':
			return Game.Random.interval(500, 999);
		case 'legion':
			return Game.Random.interval(1000, 4999);
		case 'division':
			return Game.Random.interval(5000, 9999);
		case 'corps':
			return Game.Random.interval(10000, 19999);
		case 'army':
			return Game.Random.interval(20000, 49999);
		case 'group':
			return Game.Random.interval(50000, 99999);
		case 'front':
			return Game.Random.interval(100000, 249999);
	}

	return 0;
};

Game.Unit.calculateArmyCost = function(army) {
	var cost = {
		metals: 0,
		crystals: 0,
		humans: 0
	};

	for (var side in army) {
		for (var group in army[side]) {
			for (var name in army[side][group]) {

				var count = Game.Unit.rollCount( army[side][group][name] );
				if (count <= 0) {
					continue;
				}

				var price = Game.Unit.items[side][group][name].price(count);
				if (price && price.base) {
					cost.metals += price.base.metals;
					cost.crystals += price.base.crystals;
					cost.humans += price.base.humans;
				}
			}
		}
	}

	return cost;
};

// ----------------------------------------------------------------------------
// Battle
// ----------------------------------------------------------------------------

Game.BattleHistory = {
	Collection: new Meteor.Collection('battleHistory')
};

Game.BattleHistory.Collection._ensureIndex({
	user_id: 1
});

Game.BattleHistory.add = function(userArmy, enemyArmy, options, battleResults) {
	var history = {
		user_id: options.isEarth ? 'earth' : Meteor.userId(),
		timestamp: options.timestamp ? options.timestamp : Game.getCurrentTime(),
		moveType: options.moveType,
		location: options.location,
		userLocation: options.userLocation,
		userArmy: userArmy,
		enemyLocation: options.enemyLocation,
		enemyArmy: enemyArmy
	};

	if (battleResults) {
		history.result = battleResults.result;
		history.userArmyRest = battleResults.userArmy;
		history.enemyArmyRest = battleResults.enemyArmy;
		if (battleResults.reward) {
			history.reward = battleResults.reward;
		}
		if (battleResults.artefacts) {
			history.artefacts = battleResults.artefacts;
		}
		if (battleResults.cards) {
			history.cards = battleResults.cards;
		}
	}

	var historyId = Game.BattleHistory.Collection.insert(history);

	if (options.isEarth) {
		Game.Statistic.incrementGame({
			earthHistoryCount: 1
		});
	} else if (Meteor.userId()) {
		Game.Statistic.incrementUser(Meteor.userId(), {
			battleHistoryCount: 1
		});
	}

	return historyId;
};

Game.BattleHistory.set = function(id, set) {
	Game.BattleHistory.Collection.update({
		_id: id,
		user_id: Meteor.userId()
	}, {
		$set: set
	});
};

Game.Unit.performBattle = function(userArmy, enemyArmy, options) {
	var battle = new Game.Unit.Battle(userArmy, enemyArmy, options);

	var historyId = Game.BattleHistory.add(
		userArmy,
		enemyArmy,
		options,
		battle.results
	);

	if (historyId) {
		battle.results.historyId = historyId;
	}

	return battle.results;
};

Game.Unit.Battle = function(userArmy, enemyArmy, options) {

	var currentLog = '';

	var writeLog = function(message) {
		currentLog += message + '\n';
	};

	var hasAlive = function(units) {
		for (var name in units) {
			if (units[name].life > 0) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Creates object with information for each unit from army object.
	 *
	 * army object example:
	 * {
	 *   reptiles: {
	 *     fleet: {
	 *       blade: 10,
	 *       dragon: 2
	 *     }
	 *   }
	 * }
	 *
	 * result object example:
	 * {
	 *   'reptiles.fleet.blade': {
	 *     side: 'reptiles',
	 *     group: 'fleet',
	 *     name: 'blade',
	 *     model: { Object from content },
	 *     startCount: 10,
	 *     count: 10,
	 *     life: 10000
	 *   },
	 *   ...
	 * }
	 *
	 * Warning! Properties 'count' and 'life' could be changed by other functions!
	 */
	var parseArmyToUnits = function(army) {
		if (!army) {
			return null;
		}

		var units = {};

		for (var side in army) {
			for (var group in army[side]) {
				for (var name in army[side][group]) {

					var count = Game.Unit.rollCount( army[side][group][name] );
					var model = Game.Unit.items[side][group][name];

					units[ side + '.' + group + '.' + name ] = {
						// constants
						key: side + '.' + group + '.' + name,
						side: side,
						group: group,
						name: name,
						model: model,
						startCount: count,
						// vars
						count: count,
						life: count * model.characteristics.life
					};

					// save result of rollCount
					// changes army original value!
					army[side][group][name] = count;
				}
			}
		}

		return units;
	};

	var fire = function(unit, enemyUnits) {
		// no damage this round
		if (unit.damage <= 0) return;

		// find targets
		var unitPriorTargets = unit.model.targets();
		var unitPriorTargetsDamage = [0.4, 0.3, 0.2];

		var priorTargets = [];
		var targets = [];

		var i = 0;
		var appliedDamage = 0;
		var enemy = null;

		for (var key in enemyUnits) {

			enemy = enemyUnits[key];

			// check life
			if (enemy.life <= 0) continue;

			// test enemy special group vs unit special group
			var enemySpecial = enemy.model.characteristics.special;
			var unitNotAttack = unit.model.characteristics.notAttack;

			if (enemySpecial
			 && unitNotAttack
			 && unitNotAttack.length > 0
			 && unitNotAttack.indexOf(enemySpecial) >= 0
			) {
				continue;
			}

			// save target
			targets.push(enemy);

			// check if enemy is one of priority targets
			if (unitPriorTargets) {
				for (i = 0; i < unitPriorTargets.length; i++) {
					if (enemy.side == unitPriorTargets[i].side
					 && enemy.group == unitPriorTargets[i].group
					 && enemy.name == unitPriorTargets[i].engName
					) {
						// fill array if need
						for (var j = 0; j < i; j++) {
							if (priorTargets.length < j + 1) {
								priorTargets.push(null);
							}
						}
						// save priority target
						priorTargets[i] = enemy;
						break;
					}
				}
			}
		}

		// attack priority targets
		if (priorTargets.length > 0) {

			writeLog(unit.model.name + ' (' + unit.count + ') атакует приоритетные цели с общим уроном ' + unit.damage);

			var totalDamage = unit.damage;

			for (i = 0; i < priorTargets.length; i++) {

				enemy = priorTargets[i];
				if (!enemy || enemy.life <= 0) continue;
				if (i >= unitPriorTargetsDamage.length) continue;

				appliedDamage = Math.floor( totalDamage * unitPriorTargetsDamage[i] );

				if (appliedDamage < 1) {
					appliedDamage = 1;
				}

				if (enemy.life < appliedDamage) {
					appliedDamage = enemy.life;
					enemy.life = 0;
				} else {
					enemy.life -= appliedDamage;
				}

				// save hit info
				if (!enemy.hits[unit.key]) {
					enemy.hits[unit.key] = 0;
				}
				enemy.hits[unit.key] += appliedDamage;

				// write log
				if (enemy.life > 0) {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage);
				} else {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage + ' и умирает');
				}

				if (unit.damage <= 0) return;
			}
		}

		// attack rest targets
		if (targets.length > 0) {

			writeLog(unit.model.name + ' (' + unit.count + ') атакует оставшимся уроном ' + unit.damage);

			for (i = 0; i < targets.length; i++) {

				enemy = targets[i];
				if (enemy.life <= 0) continue;

				appliedDamage = Math.floor( unit.damage / (targets.length - i) );

				if (appliedDamage < 1) {
					appliedDamage = 1;
				}

				if (enemy.life < appliedDamage) {
					appliedDamage = enemy.life;
					enemy.life = 0;
				} else {
					enemy.life -= appliedDamage;
				}

				unit.damage -= appliedDamage;

				// save hit info
				if (!enemy.hits[unit.key]) {
					enemy.hits[unit.key] = 0;
				}
				enemy.hits[unit.key] += appliedDamage;
				
				// write log
				if (enemy.life > 0) {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage);
				} else {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage + ' и умирает');
				}

				if (unit.damage <= 0) break;
			}
		}
	};

	var applyEffect = function(unit, friends, enemies, round, stage, options) {
		if (unit && unit.model && unit.model.battleEffects) {
			var effects = unit.model.battleEffects;
			for (var i = 0; i < effects.length; i++) {
				if (_.isFunction(effects[i][stage])) {
					var result = effects[i][stage](unit, friends, enemies, round, options);
					if (result && result.length > 0) {
						writeLog(result);
					}
				}
			}
		}
	};

	var applyBattleEffects = function(userUnits, enemyUnits, round, stage, options) {
		var key = null;

		for (key in userUnits) {
			applyEffect( userUnits[key], userUnits, enemyUnits, round, stage, options );
		}

		for (key in enemyUnits) {
			applyEffect( enemyUnits[key], enemyUnits, userUnits, round, stage, options );
		}
	};

	var performRound = function(userUnits, enemyUnits, round, options) {

		writeLog('----------------------');
		writeLog('Раунд ' + round);
		writeLog('----------------------');

		// calculate damage
		var key = null;
		var min = 0;
		var max = 0;
		var damage = 0;

		for (key in userUnits) {
			if (userUnits[key].model.characteristics.damage) {
				min = userUnits[key].model.characteristics.damage.min * userUnits[key].count;
				max = userUnits[key].model.characteristics.damage.max * userUnits[key].count;
				damage = Game.Random.interval( min, max ) * options.damageReduction; 
				userUnits[key].damage = damage;
			} else {
				userUnits[key].damage = 0;
			}
			userUnits[key].hits = {};
			userUnits[key].deaths = 0;
		}

		for (key in enemyUnits) {
			if (enemyUnits[key].model.characteristics.damage) {
				min = enemyUnits[key].model.characteristics.damage.min * enemyUnits[key].count;
				max = enemyUnits[key].model.characteristics.damage.max * enemyUnits[key].count;
				damage = Game.Random.interval( min, max ) * options.damageReduction; 
				enemyUnits[key].damage = damage;
			} else {
				enemyUnits[key].damage = 0;
			}
			enemyUnits[key].hits = {};
			enemyUnits[key].deaths = 0;
		}

		applyBattleEffects(userUnits, enemyUnits, round, 'onRoundStart', options);

		// attack
		for (key in userUnits) {
			fire( userUnits[key], enemyUnits, round );
		}

		writeLog('----------------------');

		for (key in enemyUnits) {
			fire( enemyUnits[key], userUnits, round );
		}

		writeLog('----------------------');

		applyBattleEffects(userUnits, enemyUnits, round, 'onAttack', options);

		// calculate round results
		var unitsLeft = 0;
		var unitsKilled = 0;
		var userKilled = {};

		for (key in userUnits) {
			unitsLeft = Math.ceil( userUnits[key].life / userUnits[key].model.characteristics.life );
			unitsKilled = userUnits[key].count - unitsLeft;

			userUnits[key].count = unitsLeft;
			userKilled[key] = unitsKilled;

			userUnits[key].killed = unitsKilled;
		}

		writeLog('Наши потери:');
		for (key in userKilled) {
			if (userKilled[key] > 0) {
				writeLog('    ' + userUnits[key].model.name + ' = ' + userKilled[key]);
			}
		}

		var enemyKilled = {};

		for (key in enemyUnits) {
			unitsLeft = Math.ceil( enemyUnits[key].life / enemyUnits[key].model.characteristics.life );
			unitsKilled = enemyUnits[key].count - unitsLeft;

			enemyUnits[key].count = unitsLeft;
			enemyKilled[key] = unitsKilled;

			enemyUnits[key].killed = unitsKilled;
		}

		writeLog('Вражеские потери:');
		for (key in enemyKilled) {
			if (enemyKilled[key] > 0) {
				writeLog('    ' + enemyUnits[key].model.name + ' = ' + enemyKilled[key]);
			}
		}

		applyBattleEffects(userUnits, enemyUnits, round, 'onRoundEnd', options);

		return {
			userKilled: userKilled,
			enemyKilled: enemyKilled
		};
	};

	var getPoints = function(resources) {
		var points = 0;
		for (var res in resources) {
			if (res != 'time') {
				points += resources[res] * (res == 'crystals' ? 3 : res == 'humans' ? 4 : 1);
			}
		}
		return points;
	};

	this.constructor = function(userArmy, enemyArmy, options) {
		// parse options
		var rounds = (options && options.rounds) ? options.rounds : 3;

		var damageReduction = (options && options.damageReduction) ? options.damageReduction : 0;
		if (damageReduction < 0) {
			damageReduction = 0;
		} else if (damageReduction >= 100) {
			damageReduction = 99.99;
		}
		damageReduction = 1 - (damageReduction / 100);

		var missionType = (options && options.missionType) ? options.missionType : null;
		var missionLevel = (options && options.missionLevel) ? options.missionLevel : null;

		var artefacts = (options && options.artefacts) ? options.artefacts : null;

		options = {
			rouns: rounds,
			damageReduction: damageReduction,
			missionType: missionType,
			missionLevel: missionLevel,
			artefacts: artefacts
		};

		// parse user army
		var userUnits = parseArmyToUnits( userArmy );

		// parse enemy army
		var enemyUnits = parseArmyToUnits( enemyArmy );

		// perform battle
		var isFinished = (userUnits && enemyUnits) ? false : true;
		var round = 1;

		while (!isFinished) {
			performRound(userUnits, enemyUnits, round, options);
			if (hasAlive(userUnits) && hasAlive(enemyUnits) && round < rounds) {
				round++;
			} else {
				isFinished = true;
				applyBattleEffects(userUnits, enemyUnits, round, 'onBattleEnd', options);
			}
		}

		// show results
		writeLog('----------------------');
		writeLog('Бой закончен');
		writeLog('----------------------');

		writeLog('Наша армия:');
		var userArmyRest = null;

		var key = null;
		var unit = null;

		for (key in userUnits) {

			unit = userUnits[key];
			writeLog('    ' + unit.model.name + ' ' + unit.count);

			if (unit.count > 0) {
				if (!userArmyRest) {
					userArmyRest = {};
				}
				if (!userArmyRest[unit.side]) {
					userArmyRest[unit.side] = {};
				}
				if (!userArmyRest[unit.side][unit.group]) {
					userArmyRest[unit.side][unit.group] = {};
				}
				userArmyRest[unit.side][unit.group][unit.name] = unit.count;
			}
		}

		writeLog('Вражеская армия:');
		var enemyArmyRest = null;
		var enemyArmyKilled = null;
		
		for (key in enemyUnits) {

			unit = enemyUnits[key];
			writeLog('    ' + unit.model.name + ' ' + unit.count);

			var killed = unit.startCount - unit.count;
			if (killed > 0) {
				if (!enemyArmyKilled) {
					enemyArmyKilled = {};
				}
				if (!enemyArmyKilled[unit.side]) {
					enemyArmyKilled[unit.side] = {};
				}
				if (!enemyArmyKilled[unit.side][unit.group]) {
					enemyArmyKilled[unit.side][unit.group] = {};
				}
				enemyArmyKilled[unit.side][unit.group][unit.name] = killed;
			}

			if (unit.count > 0) {
				if (!enemyArmyRest) {
					enemyArmyRest = {};
				}
				if (!enemyArmyRest[unit.side]) {
					enemyArmyRest[unit.side] = {};
				}
				if (!enemyArmyRest[unit.side][unit.group]) {
					enemyArmyRest[unit.side][unit.group] = {};
				}
				enemyArmyRest[unit.side][unit.group][unit.name] = unit.count;
			}
		}

		// calculate reward
		reward = null;
		cards = null;

		var mission = null;
		if (options.missionType
		 && options.missionLevel
		 && Game.Battle.items[ options.missionType ]
		 && Game.Battle.items[ options.missionType ].level
		 && Game.Battle.items[ options.missionType ].level[ options.missionLevel ]
		) {
			mission = Game.Battle.items[ options.missionType ];
		}

		if (mission) {
			reward = {};

			var killedCost = Game.Unit.calculateArmyCost(enemyArmyKilled);

			if (userArmyRest && !enemyArmyRest) {
				// metals + crystals
				if (mission.level[ options.missionLevel ].reward) {
					reward = mission.level[ options.missionLevel ].reward;
				} else {
					reward.metals = Math.floor( killedCost.metals * 0.1 );
					reward.crystals = Math.floor( killedCost.crystals * 0.1 );
				}

				// truckc grab extra reward
				var truckCount = 0;

				if (userArmyRest.army
				 && userArmyRest.army.fleet
				 && userArmyRest.army.fleet.truckc
				) {
					truckCount = userArmyRest.army.fleet.truckc;
				}

				if (truckCount > 0) {
					reward.metals += Math.min(
						truckCount * 2000,
						Math.floor( killedCost.metals * 0.4 )
					);
					reward.crystals += Math.min(
						truckCount * 1000,
						Math.floor( killedCost.crystals * 0.4 )
					);
				}

				// cards
				if (mission.level[ options.missionLevel ].cards) {
					var missionCards = mission.level[ options.missionLevel ].cards;
					for (var cardName in missionCards) {
						if (Game.Random.random() <= missionCards[cardName]) {
							if (!cards) {
								cards = {};
							}
							cards[cardName] = 1;
						}
					}
				}
			}

			// honor
			var honor = Math.floor((getPoints(killedCost) / 100) * (mission.honor * 0.01));
			if (honor > 0) {
				reward.honor = honor;
			}
		}

		// pass gained artefacts
		artefacts = null;

		if (options.artefacts) {
			if (userArmyRest && !enemyArmyRest) {
				artefacts = options.artefacts;
			}
		}

		// calc result
		var result = Game.Battle.result.tie;
		if (userArmyRest && !enemyArmyRest) {
			result = Game.Battle.result.victory;
		} else if (!userArmyRest && enemyArmyRest) {
			result = Game.Battle.result.defeat;
		}

		// save results
		this.results = {
			result: result,
			log: currentLog,
			userArmy: userArmyRest,
			enemyArmy: enemyArmyRest,
			reward: reward,
			artefacts: artefacts,
			cards: cards
		};
	};
	this.constructor(userArmy, enemyArmy, options);
};

Meteor.publish('units', function () {
	if (this.userId) {
		return Game.Unit.Collection.find({user_id: this.userId});
	}
});

};