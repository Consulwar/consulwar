initCardsServer = function() {
	
initCardsLib();

Game.Cards.Collection._ensureIndex({
	user_id: 1
});

Game.Cards.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Cards.getValue(user._id);

	if (currentValue === undefined) {
		Game.Cards.Collection.insert({
			'user_id': user._id
		});
	}
};

Game.Cards.increment = function(cards, invertSign) {
	invertSign = invertSign === true ? -1 : 1;

	Game.Cards.initialize();

	var inc = null;
	for (var key in cards) {
		if (!inc) {
			inc = {};
		}
		inc[key + '.amount'] = parseInt(cards[key] * invertSign);
	}

	if (inc) {
		Game.Cards.Collection.update({
			user_id: Meteor.userId()
		}, {
			$inc: inc
		});
	}
};

Game.Cards.add = function(cards) {
	return Game.Cards.increment(cards, false);
};

Game.Cards.spend = function(cards) {
	return Game.Cards.increment(cards, true);
};

Game.Cards.complete = function(task) {
	// no action on complete
};

Game.Cards.activate = function(item, user) {
	// check input
	if (!item || !user) {
		return false;
	}

	// check reload time
	if (item.reloadTime) {
		var nextReloadTime = item.nextReloadTime();
		if (nextReloadTime > Game.getCurrentTime()) {
			return false;
		}

		// set next reload time
		var set = {};
		set[item.engName + '.nextReloadTime'] = Game.getCurrentTime() + item.durationTime + item.reloadTime;

		Game.Cards.Collection.update({
			user_id: user._id
		}, {
			$set: set
		});
	}

	// prepare queue task
	var task = {
		type: item.type,
		engName: item.engName,
		time: item.durationTime
	};

	if (item.cardGroup) {
		task.group = item.cardGroup;
	}

	// try to find active card with same name
	var currentCard = Game.Queue.Collection.findOne({
		user_id: user._id,
		engName: item.engName,
		status: Game.Queue.status.INCOMPLETE,
		finishTime: { $gt: Game.getCurrentTime() }
	});

	if (currentCard) {
		// stop current
		Game.Queue.Collection.update({
			_id: currentCard._id
		}, {
			$set: {
				status: Game.Queue.status.DONE,
				finishTime: Game.getCurrentTime() - 1
			}
		});
		// new card time + time left
		task.time += currentCard.finishTime - Game.getCurrentTime();
	}

	// activate card
	return Game.Queue.add(task);
};

Meteor.methods({
	'cards.buyAndActivate': function (id) {
		Meteor.call('cards.buy', id);
		Meteor.call('cards.activate', id);
	},

	'cards.buy': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('cards.buy: ', new Date(), user.username);

		var item = Game.Cards.getItem(id);
		if (!item) {
			throw new Meteor.Error('Нет такой карточки');
		}

		Meteor.call('actualizeGameInfo');

		if (!item.canBuy()) {
			throw new Meteor.Error('Нельзя купить эту карточку');
		}
		
		// spend price
		var price = item.getPrice();
		
		if (price) {
			Game.Resources.spend(price);

			if (price.credits) {
				Game.Payment.logExpense({
					resources: { credits: price.credits }
				}, {
					type: 'card',
					cardId: item.engName
				});
			}
		}

		// add card
		var cards = {};
		cards[id] = 1;
		Game.Cards.add(cards);

		// save statistic
		Game.Statistic.incrementUser(user._id, {
			'cards.bought': 1
		});
	},

	'cards.activate': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}
		
		console.log('cards.activate: ', new Date(), user.username);

		var item = Game.Cards.getItem(id);
		if (!item) {
			throw new Meteor.Error('Нет такой карточки');
		}

		Meteor.call('actualizeGameInfo');

		if (item.amount() <= 0) {
			throw new Meteor.Error('Карточки заночились');
		}

		var isCardActivated = Game.Cards.activate(item, user);
		if (!isCardActivated) {
			throw new Meteor.Error('Не удалось активировать карточку');
		}

		var cards = {};
		cards[id] = 1;
		Game.Cards.spend(cards);

		// save statistic
		Game.Statistic.incrementUser(user._id, {
			'cards.activated': 1
		});
	}
});

Meteor.publish('cards', function () {
	if (this.userId) {
		return Game.Cards.Collection.find({
			user_id: this.userId
		});
	}
});

};