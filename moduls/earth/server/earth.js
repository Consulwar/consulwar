Meteor.startup(function() {

Game.Point.addReinforcement = function(units) {
	var set = {};

	for (var i = 0; i < units.length; i++) {
		set['army.' + units[i].engName] = units[i].count;
	}

	Game.Point.Collection.update({current: true}, {
		$inc: set
	})
}

var getPointsAround = function(letter, num) {
	var pointsAround = [];

	if (num > 1) {
		pointsAround.push(letter + (num - 1));
	}

	if (num < 7) {
		pointsAround.push(letter + (num + 1));
	}

	if (['a', 'c'].indexOf(letter) != -1) {
		pointsAround.push('b' + num);
		if (num > 1) {
			pointsAround.push('b' + (num - 1));
		}
		if (num < 7) {
			pointsAround.push('b' + (num + 1));
		}
	} else {
		pointsAround.push('a' + num);
		pointsAround.push('c' + num);
		if (num > 1) {
			pointsAround.push('a' + (num - 1));
			pointsAround.push('c' + (num - 1));
		}
		if (num < 7) {
			pointsAround.push('a' + (num + 1));
			pointsAround.push('c' + (num + 1));
		}
	}

	// Всё исследовано? Добавляем столицу
	if (pointsAround.length == 0) {
		pointsAround.push('d1');
	}

	return pointsAround;
}

// Исследуем точки вокруг текущей
// спауним врагов в зависимости от онлайна за последние 3 дня
Game.Point.observePoint = function(name) {
	check(name, String);
	check(name, Match.Where(function(name) {
		if (name.length != 2) {
			return false;
		}

		var letter = name.substr(0, 1);
		var num = parseInt(name.substr(1));
		
		return (name == 'd1' ||
			(['a', 'b', 'c'].indexOf(letter) != -1 
			&& !_.isNaN(num) && num > 0 && num < 8))
	}));

	// Есть еноты?
	if (Game.Global.has('research', 'reccons')) {
		var letter = name.substr(0, 1);
		var num = parseInt(name.substr(1));

		var pointsAround = getPointsAround(letter, num);

		var players = Meteor.users.find({
			'status.lastLogin.date': {
				$gt: new Date((new Date()).setDate((new Date()).getDate() - 3))
			},
			'rating': {
				$gt: 24999
			}
		}).count();

		var points = Game.Point.Collection.find({name: {$in: pointsAround}, visible: {$ne: true}}).fetch();

		for (var i = 0; i < points.length; i++) {
			var name = points[i].name;

			if (name == 'a1') {
				continue;
			}
			var level = parseInt(name[1]);

			if (name == 'd1') {
				level = 8;
			}

			var modifier = Math.pow(1.5, level);

			var effects = Game.Point.items[name].type.effects;

			var specialModifier = {
				infantry: effects.infantry && (effects.infantry.damage > 0 || effects.infantry.life > 0) ? 5 : 1,
				enginery: effects.enginery && (effects.enginery.damage > 0 || effects.enginery.life > 0) ? 2 : 1,
				artillery: effects.artillery && (effects.artillery.damage > 0 || effects.artillery.life > 0) ? 2 : 1,
				air: effects.air && (effects.air.damage > 0 || effects.air.life > 0) ? 3 : 1,
				defence: effects.defence && (effects.defence.damage > 0 || effects.defence.life > 0) ? 2 : 1,
			}

			Game.Point.Collection.update({
				name: name
			},{
				name: name,
				visible: true,
				army: {

				},
				reptiles: {
					striker: Math.floor(1000 * players * modifier * specialModifier[game.reptiles.rground.striker.special]),
					ripper: Math.floor(900 * players * modifier * specialModifier[game.reptiles.rground.ripper.special]),
					horror: Math.floor(10 * players * modifier * specialModifier[game.reptiles.rground.horror.special]),
					slider: Math.floor(8 * players * modifier * specialModifier[game.reptiles.rground.slider.special]),
					breaker: Math.floor(12 * players * modifier * specialModifier[game.reptiles.rground.breaker.special]),
					crusher: Math.floor(1 * players * modifier * specialModifier[game.reptiles.rground.crusher.special]),
					geccon: Math.floor(3 * players * modifier * specialModifier[game.reptiles.rground.geccon.special]),
					amfizben: Math.floor(20 * players * modifier * specialModifier[game.reptiles.rground.amfizben.special]),
					amphibian: Math.floor(14 * players * modifier * specialModifier[game.reptiles.rground.amphibian.special]),
					chipping: Math.floor(1 * players * modifier * specialModifier[game.reptiles.rground.chipping.special])	
				}
			}, {
				upsert: true
			})
		}
	}
}

// Движение армии в точку destination
Game.Point.moveArmy = function(destination) {
	check(destination, String);
	console.log(destination);
	var currentPoint = Game.Point.Collection.findOne({current: true});
	check(destination, Match.Where(function(destination) {
		console.log(destination, destination.length);
		if (destination.length != 2) {
			return false;
		}

		var pointsAround = getPointsAround(currentPoint.name[0], parseInt(currentPoint.name[1]));

		console.log(pointsAround, destination);
		
		return pointsAround.indexOf(destination) != -1;
	}));

	var army = _.omit(currentPoint.army, 'relax');

	var set = {
		current: true
	}

	for (var name in army) {
		set['army.' + name] = army[name];
	}

	// Новая точка
	Game.Point.Collection.update({name: destination}, {
		$set: set
	})

	// Старая точка
	Game.Point.Collection.update({_id: currentPoint._id}, {
		$set: {
			current: false,
			army: {
				relax: currentPoint.army.relax || 0
			}
		}
	})

	return army;
}

Game.Point.flee = function() {
	var currentPoint = Game.Point.Collection.findOne({current: true});
	var pointsAround = getPointsAround(currentPoint.name[0], parseInt(currentPoint.name[1]));

	Game.Point.Collection.update({
		_id: currentPoint._id
	}, {
		$set: {
			current: false,
			army: {}
		}
	});

	Game.Point.Collection.update({
		name: {$in: pointsAround}, 
		reptiles: {},
		visible: true
	}, {
		$set: {
			current: true,
			army: _.omit(currentPoint.army, 'relax')
		}
	});
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

var fight = function(army, reptiles, ourLife, enemyLife) {
	var armyNames = _.keys(Game.Unit.items.army.ground);
	var reptilesNames = _.keys(Game.Unit.items.reptiles.rground);

	var ourDamage = _.object(armyNames, _(armyNames.length).times(function(){return 0;}));

	for (var unit in army) {
		ourDamage[unit] = Game.Unit.items.army.ground[unit].characteristics.damage * army[unit];

		// 20% рандомим
		ourDamage[unit] = _.random(Math.floor(ourDamage[unit] * 0.8), ourDamage[unit]);

		// 85% ослабление на земле
		ourDamage[unit] = Math.ceil(ourDamage[unit] * 0.15);
	}

	var enemyDamage = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

	for (var unit in reptiles) {
		enemyDamage[unit] = Game.Unit.items.reptiles.rground[unit].characteristics.damage * reptiles[unit];

		// 20% рандомим
		enemyDamage[unit] = _.random(Math.floor(enemyDamage[unit] * 0.8), enemyDamage[unit]);

		// 85% ослабление на земле
		enemyDamage[unit] = Math.ceil(enemyDamage[unit] * 0.15);
	}

	//--- Наш выстрел

	for (var unit in ourDamage) {
		if (ourDamage[unit] > 0) {
			// Уровень уменьшения урона в цепочке
			var reductionLevel = 0;

			// Бьем приоритетные
			var result = fire(unit, Game.Unit.items.army.ground[unit].targets, ourDamage, enemyLife, reductionLevel);
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
			var result = fire(unit, Game.Unit.items.reptiles.rground[unit].targets, enemyDamage, ourLife, reductionLevel);
			enemyDamage = result.damage;
			ourLife = result.life;
			reductionLevel = result.reductionLevel;

			// Оставшийся урон еще бахнуть
			if (enemyDamage[unit] > 0) {
				var result = fire(unit, armyNames, enemyDamage, ourLife, reductionLevel);
				enemyDamage = result.damage;
				ourLife = result.life;
				reductionLevel = result.reductionLevel;
			}
		}
	}

	//--- Высчитываем потери

	for (var unit in army) {
		if (army[unit] > 0) {
			var unitsLeft = Math.ceil(ourLife[unit] / Game.Unit.items.army.ground[unit].characteristics.life);

			//console.log(unit, army[unit], '->', unitsLeft);

			army[unit] = unitsLeft;
		}
	}

	for (var unit in reptiles) {
		if (reptiles[unit] > 0) {
			var unitsLeft = Math.ceil(enemyLife[unit] / Game.Unit.items.reptiles.rground[unit].characteristics.life);

			//console.log(unit, reptiles[unit], '->', unitsLeft);

			reptiles[unit] = unitsLeft;
		}
	}

	return {
		army: army,
		reptiles: reptiles,
		ourLife: ourLife,
		enemyLife: enemyLife
	};
}

Game.Point.performBattle = function() {
	var currentPoint = Game.Point.Collection.findOne({current: true});


	var armyNames = _.keys(Game.Unit.items.army.ground);

	var army = _.object(armyNames, _(armyNames.length).times(function(){return 0;}));

	for (var unit in currentPoint.army) {
		if (currentPoint.army[unit] > 0) {
			army[unit] = currentPoint.army[unit];
		}
	}


	var reptilesNames = _.keys(Game.Unit.items.reptiles.rground);

	var reptiles = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

	for (var unit in currentPoint.reptiles) {
		if (currentPoint.reptiles[unit] > 0) {
			reptiles[unit] = currentPoint.reptiles[unit];
		}
	}

	var startArmy = _.clone(army);
	var startReptiles = _.clone(reptiles);


	
	var ourLife = _.object(armyNames, _(armyNames.length).times(function(){return 0;}));

	for (var unit in army) {
		ourLife[unit] = Game.Unit.items.army.ground[unit].characteristics.life * army[unit];
	}


	var enemyLife = _.object(reptilesNames, _(reptilesNames.length).times(function(){return 0;}));

	for (var unit in reptiles) {
		enemyLife[unit]   = Game.Unit.items.reptiles.rground[unit].characteristics.life * reptiles[unit];
	}

	// Работа псиоников
	var psidamage = ((Game.Global.has('research', 'psieffect') ? 0.1 : 0.05) * 0.15);
	var horrordamage = (0.05 * 0.15);
	if (army.psimans > reptiles.horror) {
		for (var name in enemyLife) {
			if (Game.Unit.items.reptiles.rground[name].type != 'enemyHero' 
				&& name != 'horror') {
				enemyLife[name] = Math.ceil(enemyLife[name] * (1 - psidamage));
			}
		}
		if (reptiles.horror && reptiles.horror > 0) {
			ourLife.psimans = Math.ceil(ourLife.psimans * (1 - horrordamage));
		}
	} else if (reptiles.horror > army.psimans) {
		for (var name in ourLife) {
			if (Game.Unit.items.army.ground[name].type != 'hero' 
				&& name != 'psimans') {
				ourLife[name] = Math.ceil(ourLife[name] * (1 - horrordamage));
			}
		}
		if (army.psimans && army.psimans > 0) {
			enemyLife.horror = Math.ceil(enemyLife.horror * (1 - psidamage));
		}
	} else {
		// Одинаково? Ну значит друг другу мозг компосируют
	}
	// Высший псионик
	var grandpsidamage = (0.15 * 0.15);
	if (reptiles.grandpsi) {
		for (var name in ourLife) {
			if (Game.Unit.items.army.ground[unit].type != 'hero' 
				&& unit != 'psimans') {
				ourLife[name] = Math.ceil(ourLife[name] * (1 - grandpsidamage));
			}
		}
	}
	//


	//console.log('Бой 1:');
	var result = fight(army, reptiles, ourLife, enemyLife);

	if (hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
		//console.log('Бой 2:');
		result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife);

		if (hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
			//console.log('Бой 3:');
			result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife);

			if (_.random(0, 1) == 1 && hasAlive(result.ourLife) && hasAlive(result.enemyLife)) {
				//console.log('Бой 4 (бонусный):');
				result = fight(result.army, result.reptiles, result.ourLife, result.enemyLife);
			}
		}
	}

	var resultOfBattle = '';
	if (hasAlive(result.ourLife)) {
		if (hasAlive(result.enemyLife)) {
			resultOfBattle = 'Ничья';
		} else {
			resultOfBattle = 'Победа';
			Game.Point.observePoint(currentPoint.name);
		}
	} else {
		resultOfBattle = 'Поражение';
	}

	//console.log(resultOfBattle);

	result = {
		startArmy: startArmy,
		army: result.army,
		startReptiles: startReptiles,
		reptiles: result.reptiles,
		result: resultOfBattle
	};

	Game.Point.Collection.update({
		_id: currentPoint._id
	}, {
		$set: {
			army: result.army,
			reptiles: result.reptiles,
			resultOfBattle: result.resultOfBattle
		}
	});

	if (resultOfBattle == 'Поражение') {
		Game.Point.flee();
	} else if (resultOfBattle == 'Победа') {
		Game.Point.Collection.update({
			_id: currentPoint._id
		}, {
			$set: {
				reptiles: {}
			}
		});
	}

	game.Mail.sendMessageToAll('battleonearth', 'Результаты боя на ' + currentPoint.name, result, Math.floor(new Date().valueOf() / 1000));

	return result;
}

Game.Point.createPoll = function() {
	var currentPoint = Game.Point.Collection.findOne({current: true});

	var finishDate = new Date();
	finishDate.setDate(new Date().getDate() + 1);
	finishDate.setHours(18);
	finishDate.setMinutes(55);
	finishDate.setSeconds(0);

	console.log('createPoll on ', currentPoint);

	if (hasAlive(currentPoint.reptiles)) {

		// Опрос — продолжаем воевать или отступаем
		var options = {
			type: 'battle',
			who: 'tilps',
			name: 'Бой на ' + currentPoint.name,
			text: 'Что предпримем?',
			options: {
				battle: 'Продолжаем бой',
				back: 'Отступаем'
			},
			startDate: Math.floor(new Date().valueOf() / 1000),
			endDate: Math.floor(finishDate.valueOf() / 1000),
			result: {
				battle: 0,
				back: 0
			},
			totalVotes: 0
		};
	} else {
		var pointsAround = getPointsAround(currentPoint.name[0], parseInt(currentPoint.name[1]));

		var pointsAroundCount = _.object(pointsAround, _(pointsAround.length).times(function(){return 0;}));
		pointsAroundCount[currentPoint.name] = 0;

		var points = Game.Point.Collection.find({name: {$in: pointsAround}, visible: true}).fetch();

		var pointsAroundData = {};

		pointsAroundData[currentPoint.name] = 'Остаемся на ' + currentPoint.name;
		for (var i = 0; i < points.length; i++) {
			if (hasAlive(points[i].reptiles)) {
				pointsAroundData[points[i].name] = 'Нападаем на ' + points[i].name;
			} else {
				pointsAroundData[points[i].name] = 'Идем на ' + points[i].name;
			}
		}

		// Опрос по движению
		var options = {
			type: 'battle',
			who: 'tilps',
			name: 'Движение с ' + currentPoint.name,
			text: 'Куда двинем?',
			options: pointsAroundData,
			startDate: Math.floor(new Date().valueOf() / 1000),
			endDate: Math.floor(finishDate.valueOf() / 1000),
			result: pointsAroundCount,
			totalVotes: 0
		};
	}

	var quizId = Game.Quiz.Collection.insert(options);

	return game.Mail.sendMessageToAll('quiz', 'Опрос: ' + options.name, quizId, Math.floor(new Date().valueOf() / 1000));
}

Game.Point.checkPoll = function() {
	var lastPoll = Game.Quiz.Collection.findOne({
		type: 'battle'
	}, {
		sort: {endDate: -1}
	});

	console.log('checkPoll lastPoll', lastPoll);

	if (lastPoll.name.indexOf('Движение') != -1) {
		// Двигаемся
		var max = null;
		for (var name in lastPoll.result) {
			if (max == null || lastPoll.result[name] > lastPoll.result[max]) {
				max = name;
			}
		}

		var currentPoint = Game.Point.Collection.findOne({current: true});
		console.log('checkPoll currentPoint', currentPoint);
		console.log('checkPoll max', max);

		if (currentPoint.name != max) {
			Game.Point.moveArmy(max);
			currentPoint = Game.Point.Collection.findOne({current: true});
			console.log('checkPoll currentPoint', currentPoint);
			if (hasAlive(currentPoint.reptiles)) {
				Game.Point.performBattle();
			}
		} else {
			// стоим на месте
			// Рептилии нападают 1/3 шанс.
			if (_.random(1, 99) <= 33) {
				var pointsAround = getPointsAround(currentPoint.name[0], parseInt(currentPoint.name[1]));

				var points = Game.Point.Collection.find({name: {$in: pointsAround}, 'reptiles.chipping': {$gt: 0}}).fetch();

				var newReptiles = _.omit(points[_.random(0, points.length - 1)].reptiles, 'chipping');

				for (var name in newReptiles) {
					newReptiles[name] = Math.ceil(newReptiles[name] / 2);
				}

				Game.Point.Collection.update({_id: currentPoint._id}, {
					$set: {
						reptiles: newReptiles
					}
				});

				currentPoint = Game.Point.Collection.findOne({current: true});

				Game.Point.performBattle();
			}
		}
	} else {
		// Воюем?
		if (lastPoll.result.battle > lastPoll.result.back) {
			Game.Point.performBattle();
		} else {
			Game.Point.flee();
		}
	}

	Game.Point.createPoll();
}

Game.Point.initialize = function() {
	var currentValue = Game.Point.Collection.findOne();

	if (currentValue == undefined) {

		// a1
		Game.Point.Collection.insert({
			name: 'a1',
			visible: true,
			current: true,
			army: {

			},
			reptiles: {

			}
		})

		//a2-a7 b1-b7 c1-c7 d1

		for (var name in Game.Point.items) {
			if (name == 'a1') {
				continue;
			}

			Game.Point.Collection.insert({
				name: name,
				visible: false,
				army: {

				},
				reptiles: {

				}
			})
		}
	}
}

SyncedCron.add({
	name: 'Проверка опросов и выполнение боевых действий',
	schedule: function(parser) {
		return parser.text('at 7:00pm every 1 day');
	},
	job: function() {
		Game.Point.checkPoll();
	}
});

/*
SyncedCron.add({
	name: 'Дополнительный бой',
	schedule: function(parser) {
		return parser.text('at 7:20pm on the 24 day of September in 2015');
	},
	job: function() {
		Game.Point.checkPoll();
	}
});*/
/*
SyncedCron.add({
	name: 'Инициализация военных действий',
	schedule: function(parser) {
		return parser.text('at 10:20am on the 24 day of August in 2015');
	},
	job: function() {
		Game.Point.observePoint('a1');
		Game.Point.createPoll();
	}
});
*/
SyncedCron.start();

Meteor.methods({
	'getPointInfo': function(name) {
		var user = Meteor.user();
		
		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		console.log('getPointInfo: ', new Date(), user.login);

		return Game.Point.Collection.findOne({
			name: name,
			visible: true
		}, {
			fields: {
				name: 1,
				army: 1,
				reptiles: 1
			}
		});
	}

	
});



});