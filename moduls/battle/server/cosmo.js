Battle = new Meteor.Collection("battle");

var rollCount = function(name) {
	if (_.isNumber(name)) {
		return name;
	}

	switch(name) {
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

var getFlightTime = function() {
	var user = Meteor.user();

	var baseTime = 1800;

	var hyperdrive = Game.Research.get('evolution', 'hyperdrive');
	if (hyperdrive) {
		return Math.floor(baseTime - (hyperdrive * 10))
	} else {
		return baseTime;
	}
}

var getPoints = function(resources) {
	var points = 0;
	for (var res in resources) {
		if (res != 'time') {
			points += resources[res] * (res == 'crystals' ? 3 : res == 'humans' ? 4 : 1);
		}
	}
	return points;
}

var fire = function(unit, targets, damage, life, reductionLevel) {
	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];

		var currentDamage = Math.floor(damage[unit] * (1 - (reductionLevel * 0.2)));

		if (life[target] > 0) {

			// Если у врага больше жизней, чем урона наносим
			if (life[target] > currentDamage) {
				life[target] -= currentDamage;
				damage[unit] = 0;
				//console.log(unit, ' стреляет по ', target, ' на ', currentDamage, '(потеря: ', reductionLevel * 20, '% урона, не убил)');
				break;
			} else { // Если у врага меньше жизней, чем урона наносим
				damage[unit] = currentDamage - life[target];
				life[target] = 0;
				//console.log(unit, ' стреляет по ', target, ' на ', currentDamage, '(потеря: ', reductionLevel * 20, '% урона, убил)');
			}

			reductionLevel++;
		}
	}

	return {
		damage: damage,
		life: life,
		reductionLevel: reductionLevel
	};
}

var hasAlive = function(units) {
	for (var unit in units) {
		if (units[unit] > 0) {
			return true;
		}
	}
	return false;
}

var fight = function(army, reptiles, ourLife, enemyLife, killed) {
	var fleetNames = _.keys(game.army.fleet);
	var reptilesNames = _.keys(game.reptiles.rfleet);

	var ourDamage = _.object(fleetNames, _(fleetNames.length).times(function(){return 0;}));

	for (var unit in army) {
		ourDamage[unit] = game.army.fleet[unit].characteristics.damage * army[unit];

		// 20% рандомим
		ourDamage[unit] = _.random(Math.floor(ourDamage[unit] * 0.8), ourDamage[unit]);
	}

	var enemyDamage = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

	for (var unit in reptiles) {
		enemyDamage[unit] = game.reptiles.rfleet[unit].characteristics.damage * reptiles[unit];

		// 20% рандомим
		enemyDamage[unit] = _.random(Math.floor(enemyDamage[unit] * 0.8), enemyDamage[unit]);
	}

	if (!ourLife) {
		ourLife = _.object(fleetNames, _(fleetNames.length).times(function(){return 0;}));

		for (var unit in army) {
			ourLife[unit] = game.army.fleet[unit].characteristics.life * army[unit];
		}
	}

	if (!enemyLife) {
		enemyLife = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

		for (var unit in reptiles) {
			enemyLife[unit]   = game.reptiles.rfleet[unit].characteristics.life   * reptiles[unit];
		}
	}

	//--- Наш выстрел

	for (var unit in ourDamage) {
		if (ourDamage[unit] > 0) {
			// Уровень уменьшения урона в цепочке
			var reductionLevel = 0;

			// Бьем приоритетные
			var result = fire(unit, game.army.fleet[unit].targets, ourDamage, enemyLife, reductionLevel);
			ourDamage = result.damage;
			enemyLife = result.life;
			reductionLevel = result.reductionLevel;

			// Оставшийся урон еще бахнуть
			if (ourDamage[unit] > 0) {
				var result = fire(unit, reptilesNames, ourDamage, enemyLife, reductionLevel);
				ourDamage = result.damage;
				enemyLife = result.life;
				reductionLevel = result.reductionLevel;
			}
		}
	}

	//--- Выстрел рептилий

	for (var unit in enemyDamage) {
		if (enemyDamage[unit] > 0) {
			// Уровень уменьшения урона в цепочке
			var reductionLevel = 0;

			// Бьем приоритетные
			var result = fire(unit, game.reptiles.rfleet[unit].targets, enemyDamage, ourLife, reductionLevel);
			enemyDamage = result.damage;
			ourLife = result.life;
			reductionLevel = result.reductionLevel;

			// Оставшийся урон еще бахнуть
			if (enemyDamage[unit] > 0) {
				var result = fire(unit, fleetNames, enemyDamage, ourLife, reductionLevel);
				enemyDamage = result.damage;
				ourLife = result.life;
				reductionLevel = result.reductionLevel;
			}
		}
	}

	//--- Высчитываем потери

	for (var unit in army) {
		if (army[unit] > 0) {
			var unitsLeft = Math.ceil(ourLife[unit] / game.army.fleet[unit].characteristics.life);

			//console.log(unit, army[unit], '->', unitsLeft);

			army[unit] = unitsLeft;
		}
	}



	killed = killed || _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

	for (var unit in reptiles) {
		if (reptiles[unit] > 0) {
			var unitsLeft = Math.ceil(enemyLife[unit] / game.reptiles.rfleet[unit].characteristics.life);

			killed[unit] += reptiles[unit] - unitsLeft;

			//console.log(unit, reptiles[unit], '->', unitsLeft);

			reptiles[unit] = unitsLeft;
		}
	}

	return {
		army: army,
		reptiles: reptiles,
		ourLife: ourLife,
		enemyLife: enemyLife,
		killed: killed
	};
}

var calculateAward = function(killed, multiplier) {
	var resources = {
		metals: 0,
		crystals: 0
	}

	var fleetNames = _.keys(game.army.fleet);
	var reptilesNames = _.keys(game.reptiles.rfleet);

	for (var name in killed) {
		if (killed[name] > 0) {
			var price = game.army.fleet[fleetNames[reptilesNames.indexOf(name)]].price(killed[name]).base;

			resources.metals += price.metals;
			resources.crystals += price.crystals;
		}
	}

	resources.metals *= multiplier;
	resources.crystals *= multiplier;

	return resources;
}

var performBattle = function(battle) {
	//var user = Meteor.user();

	//var mode = game.Battle.modes[battle.level - 1];
	var mode = Game.Battle.items[battle.type];


	if (mode.chance) {
		var r = _.random(1, 100);
		//console.log(r, mode.chance);
		if (r > mode.chance) {
			game.Mail.addSystemMessage('fleetbattle', 'Космический бой (боя не было)', {
				startArmy: battle.army,
				army: battle.army
			}, battle.fight);

			Battle.update({_id: battle._id}, {
				$set: {
					status: game.Battle.status.back
				}
			});
			return true;
		}
	}

	/*var totalPrice = {
		metals: 0,
		crystals: 0,
		humans: 0
	};*/

	var fleetNames = _.keys(game.army.fleet);

	var army = _.object(fleetNames, _(fleetNames.length).times(function(){return 0;}));

	for (var unit in battle.army) {
		if (battle.army[unit] > 0) {
			//var price = game.army.fleet[unit].price(battle.army[unit]).base;

			army[unit] = battle.army[unit];

			/*for (var res in price) {
				if (res != 'time') {
					totalPrice[res] += price[res];
				}
			}*/
		}
	}

	/*for (var res in totalPrice) {
		totalPrice[res] = Math.ceil(totalPrice[res] * 0.01 * mode.danger);
	}*/

	// Общая валюта
	//var points = getPoints(totalPrice);

	//var chances = [824, 924, 974, 999, 1000];

	var reptilesNames = _.keys(game.reptiles.rfleet);

	// Изначально врагов 0
	var reptiles = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));


	var enemies = mode.level[battle.level].enemies;

	for (var name in enemies) {
		reptiles[name] = rollCount(enemies[name]);
	}

	/*console.log('Подготовка к бою. Спавним врагов. Очков: ', points);
	while (points > 0) {
		// Пока такой выбор. 1-1000 ролл
		var choise = Math.floor(Math.random() * 1000);

		for (var i in chances) {
			if (choise < chances[i]) {
				var enemyName = reptilesNames[i];
				var enemyPointsPrice = getPoints(game.army.fleet[fleetNames[i]].price().base);

				//console.log(enemyName, '; стоит: ', enemyPointsPrice, ' в наличии: ', points);

				if (i == 0 || (Math.floor(enemyPointsPrice / 2) < points)) {
					reptiles[enemyName]++;
					points -= enemyPointsPrice;
					//console.log('Спауним');
				} else {
					//console.log('Не хватает');
				}

				break;
			}
		}
	}*/

	//console.log('Прилетело врагов: ', reptiles);
	//console.log('Наши войска: ', army);

	var startArmy = _.clone(army);
	var startReptiles = _.clone(reptiles);

	//console.log('Бой 1:');
	var result = fight(army, reptiles);

	if (hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
		//console.log('Бой 2:');
		result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife, result.killed);

		if (hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
			//console.log('Бой 3:');
			result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife, result.killed);

			if (_.random(0, 1) == 1 && hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
				//console.log('Бой 4 (бонусный):');
				result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife, result.killed);
			}
		}
	}


	var award = {
		metals: 0,
		crystals: 0,
		honor: 0
	};
	var resultOfBattle = '';
	if (hasAlive(result.ourLife)) {
		if (hasAlive(result.enemyLife)) {
			resultOfBattle = 'Ничья';
		} else {
			resultOfBattle = 'Победа';
			if (mode.level[battle.level].reward) {
				award = mode.level[battle.level].reward;
			} else {
				award = calculateAward(result.killed, 0.1);
			}
		}
	} else {
		resultOfBattle = 'Поражение';
	}

	//console.log('Убито: ', result.killed);
	//console.log(resultOfBattle);
	//console.log('Награда: ', award);


	if (!mode.level[battle.level].reward) {
		award.honor = Math.floor((getPoints(calculateAward(result.killed, 1)) / 100) * (mode.honor * 0.01));
	}

	result = {
		startArmy: startArmy,
		army: result.army,
		startReptiles: startReptiles,
		reptiles: result.reptiles,
		result: resultOfBattle,
		award: award
	};

	game.Mail.addSystemMessage('fleetbattle', 'Космический бой (' + resultOfBattle + ')', result, battle.fight);

	if (resultOfBattle != 'Поражение') {
		Battle.update({_id: battle._id}, {
			$set: {
				status: game.Battle.status.back,
				award: _.omit(result.award, 'honor'),
				army: result.army
			}
		});
	} else {
		Battle.update({_id: battle._id}, {$set:{status:game.Battle.status.ended}});
	}

	if (!mode.level[battle.level].reward) {
		Game.Resources.add({
			honor: result.award.honor
		});
	}
		

	return result;
}

var flightBack = function(battle) {
	Battle.update({_id: battle._id}, {$set:{status:game.Battle.status.ended}});

	if (battle.award) {
		Game.Resources.add(battle.award);
	}

	for (var name in battle.army) {
		Game.Unit.add({
			engName: name,
			group: 'fleet',
			count: battle.army[name]
		})
	}
}

Meteor.methods({
	sendFleet: function(type, level, fleet) {
		var user = Meteor.user();

		console.log('sendFleet: ', new Date(), user.login);

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(type, Match.Where(function(type) {
			check(type, String);

			return Game.Battle.items.hasOwnProperty(type);
		}));

		check(level, Match.Where(function(level) {
			check(level, Match.Integer);

			return level > 0 && level < 11;
		}));

		Meteor.call('actualizeGameInfo');

		check(fleet, [String]);

		if (!game.hasFleet()) {
			throw new Meteor.Error("У вас нету флота");
		}

		var currentBattles = Battle.find({'user_id': this.userId, status: {$ne: game.Battle.status.ended}}).fetch();

		if (currentBattles.length > 0) {
			throw new Meteor.Error("Гипердвигатели не готовы");
		}

		var avaliableUnits = Game.Unit.getValue().fleet;

		var army = {};
		for (var name in avaliableUnits) {
			if (fleet.indexOf(name) != -1 && avaliableUnits[name] > 0) {
				army[name] = avaliableUnits[name];
			}
		}

		if (Object.keys(army).length == 0) {
			throw new Meteor.Error("Ти что, самый умненький?");
		}

		//console.log(army);

		for (var name in army) {
			Game.Unit.remove({
				engName: name,
				group: 'fleet',
				count: army[name]
			})
		}

		Battle.insert({
			user_id: this.userId,
			type: type,
			level: level,
			army: army,
			sended: Math.floor(new Date().valueOf() / 1000),
			fight: Math.floor(new Date().valueOf() / 1000) + getFlightTime(),
			back: Math.floor(new Date().valueOf() / 1000) + (getFlightTime() * 2),
			status: game.Battle.status.flight
		});

		return true;
	},

	checkBattles: function() {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('checkBattles: ', new Date(), user.login);

		var user = Meteor.user();

		var battle = Battle.findOne({user_id: user._id, status: {$ne: game.Battle.status.ended}});

		if (battle) {
			if (battle.status == game.Battle.status.flight && battle.fight < Math.floor(new Date().valueOf() / 1000)) {
				performBattle(battle);
			} 

			if (battle.status == game.Battle.status.back && battle.back < Math.floor(new Date().valueOf() / 1000)) {
				flightBack(battle);
			}
		}
	}
});

Meteor.publish('fights', function () {
	if (this.userId) {
		return Battle.find({'user_id': this.userId, status: {$ne: game.Battle.status.ended}}, {
			fields: {
				level: 1,
				army: 1,
				sended: 1,
				fight: 1,
				back: 1,
				status: 1
			}
		})
	}
});