initUnitServer = function() {

initUnitLib();
initUnitServerMethods();

Game.Unit.set = function(unit, invertSign) {
	invertSign = invertSign == true ? -1 : 1;
	Game.Unit.initialize();

	var currentValue = Game.Unit.get(unit.group, unit.engName);

	var set = {};

	set[unit.group + '.' + unit.engName] = parseInt(currentValue + (unit.count) * invertSign);

	Game.Unit.Collection.update({'user_id': Meteor.userId()}, {$set: set});

	return set;
}

Game.Unit.add = function(unit) {
	return Game.Unit.set(unit, false);
}

Game.Unit.remove = function(unit) {
	return Game.Unit.set(unit, true);
}

Game.Unit.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Unit.getValue();

	if (currentValue == undefined) {
		Game.Unit.Collection.insert({
			user_id: user._id,
			location: Game.Unit.location.HOME
		})
	}
}

Game.Unit.slice = function(sourceId, destUnits, destLocation) {

	if (destLocation == Game.Unit.location.HOME) {
		throw new Meteor.Error('Может существовать только одна локация HOME');
	}

	var source = Game.Unit.Collection.findOne({
		_id: sourceId
	});

	if (!source) {
		throw new Meteor.Error('Нет армии с таким id');
	}

	var totalCount = 0;

	for (var group in destUnits) {
		for (var name in destUnits[group]) {

			var count = parseInt(destUnits[group][name], 10);

			if (!source[group] || !source[group][name]) {
				source[group][name] = 0;
			}
			 
			if (count > source[group][name]) {
				count = source[group][name];
			}

			destUnits[group][name] = count;
			source[group][name] -= count;

			totalCount += count;
		}
	}

	if (totalCount <= 0) {
		throw new Meteor.Error('Неправильные входные данные');
	}

	// update source
	Game.Unit.Collection.update({ _id: sourceId }, source);

	// insert new slice
	destUnits.user_id = Meteor.userId();
	destUnits.location = destLocation;

	return Game.Unit.Collection.insert(destUnits);
}

Game.Unit.merge = function(sourceId, sourceUnits, destId) {

	var source = Game.Unit.Collection.findOne({
		_id: sourceId
	});

	var dest = Game.Unit.Collection.findOne({
		_id: destId
	});

	if (!source || !dest) {
		throw new Meteor.Error('Армии с указанными id не найдены');
	}

	var restCount = 0;
	var mergeCount = 0;

	for (var group in sourceUnits) {
		for (var name in sourceUnits[group]) {

			if (!source[group] || !source[group][name]) {
				continue;
			}

			var count = parseInt(sourceUnits[group][name], 10);

			if (count > source[group][name]) {
				count = source[group][name];
			}

			dest[group][name] += count;
			source[group][name] -= count;

			restCount += source[group][name];
			mergeCount += count;
		}
	}

	// update source
	if (restCount > 0 || source.location == Game.Unit.location.HOME) {
		Game.Unit.Collection.update({ _id: sourceId }, source);
	} else {
		Game.Unit.Collection.remove({ _id: sourceId });
	}

	// update destination
	if (mergeCount > 0) {
		Game.Unit.Collection.update({ _id: destId }, dest);
	}
}

// ----------------------------------------------------------------------------
// Battle
// ----------------------------------------------------------------------------

Game.Unit.performBattle = function(userArmy, enemyArmy, options) {
	var battle = new Game.Unit.Battle(userArmy, enemyArmy, options);
	return battle.results;
}

Game.Unit.Battle = function(userArmy, enemyArmy, options) {

	var currentLog = '';

	var writeLog = function(message) {
		currentLog += message + '\n';
	}

	var rollCount = function(name) {
		if (_.isNumber(name)) {
			return name;
		}

		switch (name) {
			case 'few':
				return _.random(1, 4);
			case 'several':
				return _.random(5, 9);
			case 'pack':
				return _.random(10, 19);
			case 'lots':
				return _.random(20, 49);
			case 'horde':
				return _.random(50, 99);
			case 'throng':
				return _.random(100, 249);
			case 'swarm':
				return _.random(250, 499);
			case 'zounds':
				return _.random(500, 999);
			case 'legion':
				return _.random(1000, 4999);
			case 'division':
				return _.random(5000, 9999);
			case 'corps':
				return _.random(10000, 19999);
			case 'army':
				return _.random(20000, 49999);
			case 'group':
				return _.random(50000, 99999);
			case 'front':
				return _.random(100000, 249999);
		}
	}

	var hasAlive = function(units) {
		for (var name in units) {
			if (units[name].life > 0) {
				return true;
			}
		}
		return false;
	}

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
		var units = {};

		for (var side in army) {
			for (var group in army[side]) {
				for (var name in army[side][group]) {

					var count = rollCount( army[side][group][name] );
					var model = Game.Unit.items[side][group][name];

					units[ side + '.' + group + '.' + name ] = {
						// constants
						side: side,
						group: group,
						name: name,
						model: model,
						startCount: count,
						// vars
						count: count,
						life: count * model.characteristics.life
					}

				}
			}
		}

		return units;
	}

	var fire = function(unit, enemyUnits) {
		// no damage this round
		if (unit.damage <= 0) return;

		// find targets
		var unitPriorTargets = unit.model.targets();
		var unitPriorTargetsDamage = [0.4, 0.3, 0.2];

		var priorTargets = [];
		var targets = [];

		for (var key in enemyUnits) {

			var enemy = enemyUnits[key];

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
				for (var i = 0; i < unitPriorTargets.length; i++) {
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

			for (var i = 0; i < priorTargets.length; i++) {

				var enemy = priorTargets[i];
				if (!enemy || enemy.life <= 0) continue;
				if (i >= unitPriorTargetsDamage.length) continue;

				var appliedDamage = Math.floor( totalDamage * unitPriorTargetsDamage[i] );

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

			for (var i = 0; i < targets.length; i++) {

				var enemy = targets[i];
				if (enemy.life <= 0) continue;

				var appliedDamage = Math.floor( unit.damage / (targets.length - i) );

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

				if (enemy.life > 0) {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage);
				} else {
					writeLog('    ' + enemy.model.name + ' получает урон ' + appliedDamage + ' и умирает');
				}

				if (unit.damage <= 0) break;
			}
		}
	}

	var applyEffect = function(unit, friends, enemies, round, options) {
		if (unit
		 &&	unit.model
		 && unit.model.triggers
		 && unit.model.triggers.battle
		) {
			var effects = unit.model.triggers.battle;
			for (var i = 0; i < effects.length; i++) {
				var result = effects[i].applyEffect(unit, friends, enemies, round, options);
				if (result && result.length > 0) {
					writeLog(result);
				}
			}
		}
	}

	var applyBattleEffects = function(userUnits, enemyUnits, round, options) {
		for (var key in userUnits) {
			applyEffect( userUnits[key], userUnits, enemyUnits, round, options );
		}

		for (var key in enemyUnits) {
			applyEffect( enemyUnits[key], enemyUnits, userUnits, round, options );
		}
	}

	var performRound = function(userUnits, enemyUnits, round, options) {

		writeLog('----------------------');
		writeLog('Раунд ' + round);
		writeLog('----------------------');

		// calculate damage
		for (var key in userUnits) {
			if (userUnits[key].model.characteristics.damage) {
				var min = userUnits[key].model.characteristics.damage.min * userUnits[key].count;
				var max = userUnits[key].model.characteristics.damage.max * userUnits[key].count;
				var damage = _.random( min, max ) * options.damageReduction; 
				userUnits[key].damage = damage;
			} else {
				userUnits[key].damage = 0;
			}
		}

		for (var key in enemyUnits) {
			if (enemyUnits[key].model.characteristics.damage) {
				var min = enemyUnits[key].model.characteristics.damage.min * enemyUnits[key].count;
				var max = enemyUnits[key].model.characteristics.damage.max * enemyUnits[key].count;
				var damage = _.random( min, max ) * options.damageReduction; 
				enemyUnits[key].damage = damage;
			} else {
				enemyUnits[key].damage = 0;
			}
		}

		// attack
		for (var key in userUnits) {
			fire( userUnits[key], enemyUnits );
		}

		writeLog('----------------------');

		for (var key in enemyUnits) {
			fire( enemyUnits[key], userUnits);
		}

		writeLog('----------------------');

		// calculate round results
		var userKilled = {};

		for (var key in userUnits) {
			var unitsLeft = Math.ceil( userUnits[key].life / userUnits[key].model.characteristics.life );
			var unitsKilled = userUnits[key].count - unitsLeft;

			userUnits[key].count = unitsLeft;
			userKilled[key] = unitsKilled;
		}

		writeLog('Наши потери:');
		for (var key in userKilled) {
			if (userKilled[key] > 0) {
				writeLog('    ' + userUnits[key].model.name + ' = ' + userKilled[key]);
			}
		}

		var enemyKilled = {};

		for (var key in enemyUnits) {
			var unitsLeft = Math.ceil( enemyUnits[key].life / enemyUnits[key].model.characteristics.life );
			var unitsKilled = enemyUnits[key].count - unitsLeft;

			enemyUnits[key].count = unitsLeft;
			enemyKilled[key] = unitsKilled;
		}

		writeLog('Вражеские потери:');
		for (var key in enemyKilled) {
			if (enemyKilled[key] > 0) {
				writeLog('    ' + enemyUnits[key].model.name + ' = ' + enemyKilled[key]);
			}
		}

		return {
			userKilled: userKilled,
			enemyKilled: enemyKilled
		}
	}

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

		var options = {
			rouns: rounds,
			damageReduction: damageReduction
		}

		// parse user army
		var userUnits = parseArmyToUnits( userArmy );

		// parse enemy army
		var enemyUnits = parseArmyToUnits( enemyArmy );

		// perform battle
		var isFinished = false;
		var round = 1;

		while (!isFinished) {

			if (round <= 1) {
				applyBattleEffects(userUnits, enemyUnits, 'before', options);
			}

			performRound(userUnits, enemyUnits, round, options);

			if (hasAlive(userUnits) && hasAlive(enemyUnits) && round < rounds) {
				applyBattleEffects(userUnits, enemyUnits, round, options);
				round++;
			} else {
				applyBattleEffects(userUnits, enemyUnits, 'after', options);
				isFinished = true;
			}
		}

		// show results
		writeLog('----------------------');
		writeLog('Бой закончен');
		writeLog('----------------------');

		writeLog('Наша армия:');
		var userArmyRest = null;

		for (var key in userUnits) {

			var unit = userUnits[key];
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
		
		for (var key in enemyUnits) {

			var unit = enemyUnits[key];
			writeLog('    ' + unit.model.name + ' ' + unit.count);

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

		this.results = {
			log: currentLog,
			userArmy: userArmyRest,
			enemyArmy: enemyArmyRest
		}
	}
	this.constructor(userArmy, enemyArmy, options);
}

Meteor.publish('units', function () {
	if (this.userId) {
		return Game.Unit.Collection.find({user_id: this.userId});
	}
});

}