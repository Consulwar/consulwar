initUnitServerMethods = function() {
'use strict';

Meteor.methods({
	'unit.build': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('unit.build: ', new Date(), user.username);

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);
		check(options.count, Number);

		options.count = parseInt(options.count, 10);

		if (options.count < 1 || _.isNaN(options.count)) {
			throw new Meteor.Error('Не умничай');
		}

		let cardsObject = {};
		let cardList = [];

		if (options.cards) {
			check(options.cards, Object);

			cardsObject = options.cards;

			if (!Game.Cards.canUse(cardsObject, user)) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}

			cardList = Game.Cards.objectToList(cardsObject);
		}

		Meteor.call('actualizeGameInfo');

		var item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

		if (!item || !item.canBuild(options.count)) {
			throw new Meteor.Error('Не достаточно ресурсов');
		}

		if (item.maxCount !== undefined) {
			var countDelta = item.maxCount - item.totalCount();
			if (countDelta < 1) {
				throw new Meteor.Error('Достигнуто максимальное количество юнитов данного типа');	
			}

			if (countDelta < options.count) {
				options.count = countDelta;
			}
		}

		var set = {
			type: item.type,
			group: item.group,
			engName: item.engName,
			count: options.count,
			dontNeedResourcesUpdate: true
		};

		let price = item.price(options.count, cardList);
		set.time = price.time;

		var isTaskInserted = Game.Queue.add(set);
		if (!isTaskInserted) {
			throw new Meteor.Error('Не удалось начать подготовку юнитов');
		}

		for (let card of cardList) {
			Game.Cards.activate(card, user);
		}

		Game.Cards.spend(cardsObject);

		Game.Resources.spend(price);
		
		if (price.credits) {
			Game.Payment.Expense.log(price.credits, 'unitBuild', {
				group: set.group,
				name: set.engName,
				count: set.count
			});
		}

		Meteor.users.update({
			_id: user._id
		}, {
			$inc: {
				rating: Game.Resources.calculateRatingFromResources(price)
			}
		});
	},

	'unit.speedup': function(options) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('unit.speedup: ', new Date(), user.username);

		check(options, Object);
		check(options.group, String);
		check(options.engName, String);

		let cardsObject = {};
		let cardList = [];

		if (options.cards) {
			check(options.cards, Object);

			cardsObject = options.cards;

			if (!Game.Cards.canUse(cardsObject, user)) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}

			cardList = Game.Cards.objectToList(cardsObject);
		}

		if (cardList.length === 0) {
			throw new Meteor.Error('Карточки не выбраны');
		}

		Meteor.call('actualizeGameInfo');

		let item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

		if (!item) {
			throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
		}

		let task = Game.Queue.getGroup(item.group);
		if (!task || task.engName !== options.engName) {
			throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
		}

		let maxSpendTime = task.finishTime - Game.getCurrentTime() - 2;

		let priceWithoutCards = item.price(task.count);
		let priceWithCards = item.price(task.count, cardList);

		let spendTime = Math.min(priceWithoutCards.time - priceWithCards.time, maxSpendTime);

		if (_.isNaN(spendTime) || spendTime <= 0) {
			throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
		}

		Game.Queue.spendTime(task._id, spendTime);

		for (let card of cardList) {
			Game.Cards.activate(card, user);
		}

		Game.Cards.spend(cardsObject);
	},

	'unit.instantDamage': function(options) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('unit.instantDamage: ', new Date(), user.username);

		let cardsObject = {};
		let cardList = [];

		if (options.cards) {
			check(options.cards, Object);

			cardsObject = options.cards;

			if (!Game.Cards.canUse(cardsObject, user)) {
				throw new Meteor.Error('Карточки недоступны для применения');
			}

			cardList = Game.Cards.objectToList(cardsObject);
		}

		if (cardList.length === 0) {
			throw new Meteor.Error('Карточки не выбраны');
		}

		let result = Game.Effect.Special.getValue(true, { engName: 'instantDamage' }, cardList);

		let userArmy = {army: {instant: {}}};

		for (let unitName in result) {
			if (result.hasOwnProperty(unitName)) {
				let count = result[unitName];

				if (!_.isNumber(count) || count <= 0) {
					throw new Meteor.Error('Карточки недоступны для применения');
				}

				if (!userArmy.army.instant[unitName]) {
					userArmy.army.instant[unitName] = 0;
				}

				userArmy.army.instant[unitName] += count;
			}
		}

		let planet = Game.Planets.getOne(options.planetId);

		if (planet.user_id !== user._id) {
			throw new Meteor.Error('В анус себе надемаж пёс!');
		}

		if (!planet.mission) {
			throw new Meteor.Error('Враги отсутствуют.');
		}

		let enemyFleet = Game.Planets.getFleetUnits(planet._id);
		let enemyArmy = { reptiles: { fleet: enemyFleet } };

		let battleOptions = {
			missionType: planet.mission.type,
			missionLevel: planet.mission.level,
			location: planet._id,
			userLocation: null,
			enemyLocation: planet._id,
			isOnlyDamage: true
		};

		let battleResult = Game.Unit.performBattle(userArmy, enemyArmy, battleOptions);

		let resultEnemyArmy = battleResult.enemyArmy;

		if (resultEnemyArmy) {
			planet.mission.units = resultEnemyArmy.reptiles.fleet;
		} else {
			planet.mission = null;
		}

		Game.Planets.update(planet);
	},

	'battleHistory.getPage': function(page, count, isEarth) {
		check(page, Match.Integer);
		check(count, Match.Integer);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('battleHistory.getPage: ', new Date(), user.username);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		return Game.BattleHistory.Collection.find({
			user_id: isEarth ? 'earth' : user._id
		}, {
			sort: { timestamp: -1 },
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		}).fetch();
	},

	'battleHistory.getById': function(id, isEarth) {
		check(id, String);

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('battleHistory.getById: ', new Date(), user.username);

		return Game.BattleHistory.Collection.findOne({
			_id: id,
			user_id: isEarth ? 'earth' : user._id
		});
	}
});

};