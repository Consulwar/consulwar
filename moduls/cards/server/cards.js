initCardsServer = function() {
'use strict';
	
initCardsLib();

Game.Cards.Collection._ensureIndex({
	user_id: 1
});

Game.Cards.increment = function(cards, invertSign, uid = Meteor.userId()) {
	invertSign = invertSign === true ? -1 : 1;

	var inc = null;
	for (var key in cards) {
		if (!inc) {
			inc = {};
		}
		inc[key + '.amount'] = parseInt(cards[key] * invertSign);
	}

	if (inc) {
		Game.Cards.Collection.upsert({
			user_id: uid
		}, {
			$inc: inc
		});
	}
};

Game.Cards.add = function(cards, uid) {
	return Game.Cards.increment(cards, false, uid);
};

Game.Cards.spend = function(cards) {
	let inc = null;
	let totalCount = 0;
	let incGroup = {};
	for (let id in cards) {
		if (cards.hasOwnProperty(id)) {
			if (!inc) {
				inc = {};
			}
			let card = Game.Cards.getItem(id);
			let count = parseInt(cards[id]);
			inc[`cards.used.${card.group}.${id}`] = count;
			totalCount += count;

			if (!incGroup[card.group]) {
				incGroup[card.group] = 0;
			}

			incGroup[card.group] += count;
		}
	}

	if (inc) {
		inc['cards.used.total'] = totalCount;

		for (let group in incGroup) {
			if (incGroup.hasOwnProperty(group)) {
				let count = incGroup[group];

				inc[`cards.used.${group}.total`] = count;
			}
		}

		Game.Statistic.incrementUser(Meteor.userId(), inc);
	}

	return Game.Cards.increment(cards, true);
};

Game.Cards.complete = function(task) {
	// no action on complete
};

Game.Cards.activate = function(item, user) {
	if (!Game.Cards.canActivate(item, user)) {
		return false;
	}

	// check reload time
	if (item.reloadTime) {
		// set next reload time
		var set = {};
		set[item.engName + '.nextReloadTime'] = Game.getCurrentTime() + item.durationTime + item.reloadTime;

		Game.Cards.Collection.upsert({
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

		Game.Log.method('cards.buy');

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
				Game.Payment.Expense.log(price.credits, 'card', {
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
			[`cards.bought.${item.group}.${item.engName}`]: 1
		});

		Game.Statistic.incrementUser(user._id, {
			[`cards.bought.total`]: 1
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
		
		Game.Log.method('cards.activate');

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
	}
});

Meteor.publish('cards', function () {
	if (this.userId) {
		return Game.Cards.Collection.find({
			user_id: this.userId
		});
	}
});

SyncedCron.add({
	name: 'Выдача контейнеров за донат',
	schedule: function(parser) {
		return parser.text('at 1:00 am');
	},
	job: function() {
		var users = Game.Queue.Collection.find({
			engName: 'Crazy', 
			finishTime: {
				$gt: Game.getCurrentTime()
			}
		}, {
			user_id: 1
		}).fetch();

		console.log('Give containers to ', users.length, ' users');

		for (var i = 0; i < users.length; i++) {
			console.log('Give to ', users[i].user_id);

			Game.Building.special.Container.Collection.upsert({
				user_id: users[i].user_id
			}, {
				$inc: {
					'defaultContainer.amount': 1
				}
			});
		}
	}
});

};