initBuildingServerMethods = function(){
'use strict';

Meteor.methods({
	'building.build': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('building.build: ', new Date(), user.username);

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

		Meteor.call('actualizeGameInfo');

		var item = Game.Building.items[options.group] && Game.Building.items[options.group][options.engName];

		if (!item || !item.canBuild()) {
			throw new Meteor.Error('Строительство невозможно');
		}

		var set = {
			type: item.type,
			group: item.group,
			engName: item.engName,
			level: item.currentLevel() + 1
		};

		if (set.level > item.maxLevel) {
			throw new Meteor.Error('Здание уже максимального уровня');
		}

		let price = item.price(null, cardList);
		set.time = price.time;

		var isTaskInserted = Game.Queue.add(set);
		if (!isTaskInserted) {
			throw new Meteor.Error('Не удалось начать строительство');
		}

		for (let card of cardList) {
			Game.Cards.activate(card, user);
		}

		Game.Cards.spend(cardsObject);

		Game.Resources.spend(price);

		if (price.credits) {
			Game.Payment.Expense.log(price.credits, 'building', {
				group: set.group,
				name: set.engName,
				level: set.level
			});
		}

		Meteor.users.update({
			_id: user._id
		}, {
			$inc: {
				rating: Game.Resources.calculateRatingFromResources(price)
			}
		});
	}
});

};