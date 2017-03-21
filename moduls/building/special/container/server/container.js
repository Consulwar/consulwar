initBuildingSpecialContainerServer = function() {
'use strict';

initBuildingSpecialContainerLib();
initBuildingSpecialContainerContentServer();

Game.Building.special.Container.Collection._ensureIndex({
	user_id: 1
});

Game.Building.special.Container.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Building.special.Container.getValue(user._id);

	if (currentValue === undefined) {
		Game.Building.special.Container.Collection.insert({
			user_id: user._id
		});
	}
};

Game.Building.special.Container.increment = function(containers, invertSign) {
	invertSign = invertSign === true ? -1 : 1;

	Game.Building.special.Container.initialize();

	var inc = null;
	for (var key in containers) {
		if (!inc) {
			inc = {};
		}
		inc[key + '.amount'] = parseInt(containers[key] * invertSign);
	}

	if (inc) {
		Game.Building.special.Container.Collection.update({
			user_id: Meteor.userId()
		}, {
			$inc: inc
		});
	}
};

Game.Building.special.Container.add = function(containers) {
	return Game.Building.special.Container.increment(containers, false);
};

Game.Building.special.Container.spend = function(containers) {
	return Game.Building.special.Container.increment(containers, true);
};

Meteor.methods({
	'containers.open': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		if (Game.Building.items.residential.spaceport.currentLevel() < 1) {
			throw new Meteor.Error('Нужно построить космопорт');
		}

		console.log('containers.open: ', new Date(), user.username);

		var container = Game.Building.special.Container.items[id];

		if (!container) {
			throw new Meteor.Error('Нет такого контейнера');
		}

		// roll profit
		var profit = Game.Resources.rollProfit(container.drop);

		if (container.amount() > 0) {

			// spend container
			var containers = {};
			containers[id] = 1;
			Game.Building.special.Container.spend(containers);

		} else {

			// check price
			Meteor.call('actualizeGameInfo');
			if (!container.checkPrice()) {
				throw new Meteor.Error('Невозможно купить контейнер');
			}

			// spend resources
			var price = container.getPrice();
			
			if (price) {
				Game.Resources.spend(price);

				if (price.credits) {
					Game.Payment.Expense.log(price.credits, 'container', {
						containerId: container.engName,
						profit: profit
					});
				}
			}
		}

		// add profit
		if (profit) {
			Game.Resources.addProfit(profit);
		}

		return profit;
	}
});

Meteor.publish('containers', function () {
	if (this.userId) {
		return Game.Building.special.Container.Collection.find({
			user_id: this.userId
		});
	}
});

};