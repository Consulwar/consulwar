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

	// save statistic
	var increment = {};
	increment['units.build.total'] = task.count;
	increment['units.build.army.' + task.group + '.' + task.engName] = task.count;
	Game.Statistic.incrementUser(Meteor.userId(), increment);
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
					if (price.base.metals) {
						cost.metals += price.base.metals;
					}
					if (price.base.crystals) {
						cost.crystals += price.base.crystals;
					}
					if (price.base.humans) {
						cost.humans += price.base.humans;
					}
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
	
	return Game.BattleHistory.Collection.insert(history);
};

Game.BattleHistory.set = function(id, set) {
	Game.BattleHistory.Collection.update({
		_id: id,
		user_id: Meteor.userId()
	}, {
		$set: set
	});
};


/*
Метод Game.Unit.performBattle принимает следующие аргументы:
userArmy - наша армия
enemyArmy - вражеская армия
options {
	rounds: 3, - максимальное количество раундов
	damageReduction: 75, - на сколько уменьшается наносимый урон в процентах
	missionType: 'patrolfleet', - тип миссии
	missionLevel: 10, - уровень сложности миссии
	artefacts: { Объект с артефактами }
}

Перед началом боя наша и вражеская армии перегоняются из вот такого формата:
{
	reptiles: {
		fleet: {
			blade: 10,
			dragon: 2,
			...
		},
		...
	}
}

В следующий формат:
{
	'reptiles.fleet.blade': {
		key: 'reptiles.fleet.blade',
		side: 'reptiles',
		group: 'fleet',
		name: 'blade',
		model: { Объект контента game.Unit или game.ReptileUnit },
		startCount: 10, - начальное количество (не изменяется)
		count: 10, - текущее количество
		life: 1000, - жизни
		damage: 100500, - урон рассчитанный для текущего раунда
		hits: {}, - список полученных повреждений в текущем раунде
		killed: 0 - колчиество убитых юнитов в текущем раунде
	},
	...
}

1. Перед началом битвы применяются спец способности привязанные к onBattleStart.
Можно использовать поля count, life.
Поля hits, killed, damage ещё не актуальны.

2. Начинается очередной раунд. Рассчитывается значение damage и обнуляются значения hits и killed.

3. Применяются спец способности привязанные к onRoundStart.
Можно использовать поля count, life, damage.
Поля hits, killed ещё не актуальны.

4. Армии наносят повреждения друг другу по следующим правилам:
	- 40% урона по первой приоритеной цели из списка
	- 30% урона по второй приоритетной цели из списка
	- 20% урона по третьей приоритетной цели из списка
	- Оставшийся урон равномерно распределяется по всем целям

Полученные повреждения вычитаются из поля life и сохраняются в hits:
{
	'reptiles.fleet.blade': 200,
	'reptiles.fleet.shadow': 1400,
	...
}

5. Применяются спец способности привязанные к onAttack.
Можно использовать поля life, hits.
Поле damage уже не актуально.
Поле count будет рассчитано на основе значения поля life.
Поле killed ещё не рассчитано.

6. Применяются полученные повреждения, то есть рассчитываются значения count и killed.

7. Применяются спец способности привязанные к onRoundEnd.
Можно использовать поля count, life, killed.
Поля damage, hits уже не актуальны.

8. Если обе армии ещё живы и максимальное количество раундов не превышено,
то начинаем очередной раунд (то есть возвращаемся к пункту 2).

9. Применяются спец спобособности привязанные к onBattleEnd.
Можно использовать любые поля по своему усмотрению.

10. Рассчитываются результаты битвы (награда, убитые, выжившие)

*/

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
		// Выключил лог, так как он нигде не юзается, а память жрет.
		// И вообще мы его будем переделывать!
		// currentLog += message + '\n';
	};

	var hasAlive = function(units) {
		for (var name in units) {
			if (units[name].life > 0) {
				return true;
			}
		}
		return false;
	};

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

					// get characteristics once before battle
					var characteristics = (options && options.isEarth)
						? model.earthCharacteristics
						: model.characteristics;

					units[ side + '.' + group + '.' + name ] = {
						// constants
						key: side + '.' + group + '.' + name,
						side: side,
						group: group,
						name: name,
						model: model,
						startCount: count,
						characteristics: characteristics,
						// vars
						count: count,
						life: count * characteristics.life
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
			var enemySpecial = enemy.characteristics.special;
			var unitNotAttack = unit.characteristics.notAttack;

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
				unit.damage -= appliedDamage;

				// save hit info
				if (!enemy.hits[unit.key]) {
					enemy.hits[unit.key] = 0;
				}
				enemy.hits[unit.key] += appliedDamage;

				writeLog('    ' + enemy.model.name + ' ' + appliedDamage);

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
				
				writeLog('    ' + enemy.model.name + ' ' + appliedDamage);

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

		writeLog('');
		writeLog('------------------------------');
		writeLog('Раунд ' + round);
		writeLog('------------------------------');

		// calculate damage
		var key = null;
		var damage = null;

		for (key in userUnits) {
			if (userUnits[key].characteristics.damage) {
				damage = Game.Effect.Special.applyTo(
					{ engName: 'roundDamage' + round }, 
					userUnits[key].characteristics,
					true,
					// TODO: Убрать эту херню позже!
					//       Смотри метод earthCharacteristics!
					options.isEarth
				).damage;
				userUnits[key].damage = Math.floor(
					Game.Random.interval( damage.min, damage.max ) * 
					userUnits[key].count * options.damageReduction
				);
			} else {
				userUnits[key].damage = 0;
			}
			userUnits[key].hits = {};
			userUnits[key].deaths = 0;
		}

		for (key in enemyUnits) {
			if (enemyUnits[key].characteristics.damage) {
				damage = enemyUnits[key].characteristics.damage;
				enemyUnits[key].damage = Math.floor(
					Game.Random.interval( damage.min, damage.max ) * 
					enemyUnits[key].count * options.damageReduction
				);
			} else {
				enemyUnits[key].damage = 0;
			}
			enemyUnits[key].hits = {};
			enemyUnits[key].deaths = 0;
		}

		applyBattleEffects(userUnits, enemyUnits, round, 'onRoundStart', options);

		// attack
		writeLog('---- Наша атака --------------');
		for (key in userUnits) {
			fire( userUnits[key], enemyUnits, round );
		}

		writeLog('---- Вражеская атака ---------');
		for (key in enemyUnits) {
			fire( enemyUnits[key], userUnits, round );
		}

		writeLog('---- Спец способности --------');
		applyBattleEffects(userUnits, enemyUnits, round, 'onAttack', options);

		var attackerKey = null;
		var attacks = null;
		var total = 0;

		writeLog('---- Наши повреждения --------');
		for (key in userUnits) {
			attacks = [];
			total = 0;
			for (attackerKey in userUnits[key].hits) {
				if (userUnits[key].hits[attackerKey] > 0 && enemyUnits[attackerKey]) {
					total += userUnits[key].hits[attackerKey];
					attacks.push('    ' + userUnits[key].hits[attackerKey] + ' от ' + enemyUnits[attackerKey].model.name);
				}
			}
			if (total > 0) {
				writeLog(userUnits[key].model.name + ' получает урон ' + total + '\n' + attacks.join('\n'));
			}
		}

		writeLog('---- Вражеские повреждения ---');
		for (key in enemyUnits) {
			attacks = [];
			total = 0;
			for (attackerKey in enemyUnits[key].hits) {
				if (enemyUnits[key].hits[attackerKey] > 0 && userUnits[attackerKey]) {
					total += enemyUnits[key].hits[attackerKey];
					attacks.push('    ' + enemyUnits[key].hits[attackerKey] + ' от ' + userUnits[attackerKey].model.name);
				}
			}
			if (total > 0) {
				writeLog(enemyUnits[key].model.name + ' получает урон ' + total + '\n' + attacks.join('\n'));
			}
		}

		// calculate round results
		var unitsLeft = 0;
		var unitsKilled = 0;

		writeLog('---- Наши потери -------------');
		for (key in userUnits) {
			unitsLeft = Math.ceil( userUnits[key].life / userUnits[key].characteristics.life );
			unitsKilled = userUnits[key].count - unitsLeft;

			userUnits[key].count = unitsLeft;
			userUnits[key].killed = unitsKilled;

			if (userUnits[key].killed > 0) {
				writeLog('    ' + userUnits[key].model.name + ' = ' + userUnits[key].killed);
			}
		}

		writeLog('---- Вражеские потери --------');
		for (key in enemyUnits) {
			unitsLeft = Math.ceil( enemyUnits[key].life / enemyUnits[key].characteristics.life );
			unitsKilled = enemyUnits[key].count - unitsLeft;

			enemyUnits[key].count = unitsLeft;
			enemyUnits[key].killed = unitsKilled;

			if (enemyUnits[key].killed > 0) {
				writeLog('    ' + enemyUnits[key].model.name + ' = ' + enemyUnits[key].killed);
			}
		}

		writeLog('---- Спец способности --------');
		applyBattleEffects(userUnits, enemyUnits, round, 'onRoundEnd', options);

		writeLog('');
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
			isEarth: options ? options.isEarth : false,
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
			if (round == 1) {
				applyBattleEffects(userUnits, enemyUnits, round, 'onBattleStart', options);
			}

			performRound(userUnits, enemyUnits, round, options);
			
			if (hasAlive(userUnits) && hasAlive(enemyUnits) && round < rounds) {
				round++;
			} else {
				isFinished = true;
				applyBattleEffects(userUnits, enemyUnits, round, 'onBattleEnd', options);
			}
		}

		// show results
		writeLog('');
		writeLog('----------------------');
		writeLog('Бой закончен');
		writeLog('----------------------');

		writeLog('Наша армия:');
		var userArmyRest = null;

		var key = null;
		var unit = null;

		for (key in userUnits) {
			unit = userUnits[key];
			
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
				writeLog('    ' + unit.model.name + ' ' + unit.count);
			}
		}

		writeLog('Вражеская армия:');
		var enemyArmyRest = null;
		var enemyArmyKilled = null;
		
		for (key in enemyUnits) {
			unit = enemyUnits[key];

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
				writeLog('    ' + unit.model.name + ' ' + unit.count);
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

				// reward bonus
				if (options.missionType == 'tradefleet') {
					reward = Game.Effect.Special.applyTo({ engName: 'tradefleetBonus' }, reward, true);
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
					var truckCapacity = Game.Effect.Special.getValue(true, { engName: 'truckCapacity' });
					reward.metals += Math.min(
						truckCount * truckCapacity.metals,
						Math.floor( killedCost.metals * 0.4 )
					);
					reward.crystals += Math.min(
						truckCount * truckCapacity.crystals,
						Math.floor( killedCost.crystals * 0.4 )
					);
				}

				// cards
				if (mission.level[ options.missionLevel ].cards) {
					var missionCards = mission.level[ options.missionLevel ].cards;
					for (var cardName in missionCards) {
						if (Game.Random.chance( missionCards[cardName] )) {
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

		// save statistic
		var name = null;
		var amount = null;
		var increment = {};

		increment['battle.total'] = 1;
		if (result == Game.Battle.result.tie) {
			increment['battle.tie'] = 1;
		} else if (result == Game.Battle.result.victory) {
			increment['battle.victory'] = 1;
		} else if (result == Game.Battle.result.defeat) {
			increment['battle.defeat'] = 1;
		}

		if (options.missionType && options.missionLevel) {
			increment['battle.' + options.missionType + '.total'] = 1;
			increment['battle.' + options.missionType + '.' + options.missionLevel + '.total'] = 1;
			if (result == Game.Battle.result.tie) {
				increment['battle.' + options.missionType + '.tie'] = 1;
				increment['battle.' + options.missionType + '.' + options.missionLevel + '.tie'] = 1;
			} else if (result == Game.Battle.result.victory) {
				increment['battle.' + options.missionType + '.victory'] = 1;
				increment['battle.' + options.missionType + '.' + options.missionLevel + '.victory'] = 1;
			} else if (result == Game.Battle.result.defeat) {
				increment['battle.' + options.missionType + '.defeat'] = 1;
				increment['battle.' + options.missionType + '.' + options.missionLevel + '.defeat'] = 1;
			}
		}

		increment['units.lost.total'] = 0;
		for (name in userUnits) {
			amount = userUnits[name].startCount - userUnits[name].count;
			if (amount > 0) {
				increment['units.lost.' + name] = amount;
				increment['units.lost.total'] += amount;
			}
		}

		increment['reptiles.killed.total'] = 0;
		for (name in enemyUnits) {
			amount = enemyUnits[name].startCount - enemyUnits[name].count;
			if (amount > 0) {
				increment['reptiles.killed.' + name] = amount;
				increment['reptiles.killed.total'] += amount;
			}
		}

		if (options.isEarth) {
			Game.Statistic.incrementGame(increment);
		} else {
			Game.Statistic.incrementUser(Meteor.userId(), increment);
		}
	};
	this.constructor(userArmy, enemyArmy, options);
};

Meteor.publish('units', function () {
	if (this.userId) {
		return Game.Unit.Collection.find({user_id: this.userId});
	}
});

};