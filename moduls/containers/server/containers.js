initContainersServer = function() {

initContainersLib();
initContainersContentServer();

Game.Containers.Collection._ensureIndex({
	user_id: 1
});

Game.Containers.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Containers.getValue(user._id);

	if (currentValue === undefined) {
		Game.Containers.Collection.insert({
			user_id: user._id
		});
	}
};

Game.Containers.increment = function(containers, invertSign) {
	invertSign = invertSign === true ? -1 : 1;

	Game.Containers.initialize();

	var inc = null;
	for (var key in containers) {
		if (!inc) {
			inc = {};
		}
		inc[key + '.amount'] = parseInt(containers[key] * invertSign);
	}

	if (inc) {
		Game.Containers.Collection.update({
			user_id: Meteor.userId()
		}, {
			$inc: inc
		});
	}
};

Game.Containers.add = function(containers) {
	return Game.Containers.increment(containers, false);
};

Game.Containers.spend = function(containers) {
	return Game.Containers.increment(containers, true);
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

		var container = Game.Containers.items[id];

		if (!container) {
			throw new Meteor.Error('Нет такого контейнера');
		}

		// roll profit
		var profit = Game.Resources.rollProfit(container.drop);

		if (container.amount() > 0) {

			// spend container
			var containers = {};
			containers[id] = 1;
			Game.Containers.spend(containers);

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
		return Game.Containers.Collection.find({
			user_id: this.userId
		});
	}
});

};