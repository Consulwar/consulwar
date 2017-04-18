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

		let cardsObject = options.cards;
		let cardList = [];

		if (cardsObject) {
			check(cardsObject, Object);

			check(cardsObject, Match.Where(function(cards) {
				for (let cardId in cards) {
					if (cards.hasOwnProperty(cardId)) {
						let card = Game.Cards.getItem(cardId);
						if (!card) {
							throw new Match.Error('Нет такой карточки');
						}

						let count = cards[cardId];
						if (count <= 0) {
							throw new Match.Error('Неверное количество карточек');
						}

						_.times(count, () => cardList.push(card));
					}
				}

				return true;
			}));
		} else {
			cardsObject = {};
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

		for (let cardId in cardsObject) {
			if (cardsObject.hasOwnProperty(cardId)) {
				let count = cardsObject[cardId];
				let card = Game.Cards.getItem(cardId);

				if (card.amount() < count) {
					throw new Meteor.Error('Карточки закончились');
				}

				_.times(count, function() {
					let isCardActivated = Game.Cards.activate(card, user);
					if (!isCardActivated) {
						throw new Meteor.Error('Не удалось активировать карточку');
					}
				});
			}
		}

		let price = item.price(null, cardList);
		for (let name in price) {
			if (price.hasOwnProperty(name)) {
				let count = price[name];
				if (count < 0) {
					price[name] = 0;
				}
			}
		}

		set.time = Math.max(2, price.time);

		var isTaskInserted = Game.Queue.add(set);
		if (!isTaskInserted) {
			throw new Meteor.Error('Не удалось начать строительство');
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