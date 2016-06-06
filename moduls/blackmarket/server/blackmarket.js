initBlackmarketServer = function() {

initBlackmarketLib();
initBlackmarketContentServer();

Game.Blackmarket.Collection._ensureIndex({
	user_id: 1
});

Game.Blackmarket.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Blackmarket.getValue(user._id);

	if (currentValue === undefined) {
		Game.Blackmarket.Collection.insert({
			user_id: user._id
		});
	}
};

Game.Blackmarket.increment = function(packs, invertSign) {
	invertSign = invertSign === true ? -1 : 1;

	Game.Blackmarket.initialize();

	var inc = null;
	for (var key in packs) {
		if (!inc) {
			inc = {};
		}
		inc[key + '.amount'] = parseInt(packs[key] * invertSign);
	}

	if (inc) {
		Game.Blackmarket.Collection.update({
			user_id: Meteor.userId()
		}, {
			$inc: inc
		});
	}
};

Game.Blackmarket.add = function(packs) {
	return Game.Blackmarket.increment(packs, false);
};

Game.Blackmarket.spend = function(packs) {
	return Game.Blackmarket.increment(packs, true);
};

Meteor.methods({
	'blackmarket.openPack': function(id) {
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

		console.log('blackmarket.buyPack: ', new Date(), user.username);

		var pack = Game.Blackmarket.items[id];

		if (!pack) {
			throw new Meteor.Error('Нет такого сундука');
		}

		// roll profit
		var profit = Game.Resources.rollProfit(pack.drop);

		if (pack.amount() > 0) {

			// spend pack
			var packs = {};
			packs[id] = 1;
			Game.Blackmarket.spend(packs);

		} else {

			// check price
			Meteor.call('actualizeGameInfo');
			if (!pack.checkPrice()) {
				throw new Meteor.Error('Невозможно купить сундук');
			}

			// spend resources
			var price = pack.getPrice();
			
			if (price) {
				Game.Resources.spend(price);

				if (price.credits) {
					Game.Payment.Expense.log(price.credits, 'blackmarketPack', {
						packId: pack.engName,
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

Meteor.publish('blackmarket', function () {
	if (this.userId) {
		return Game.Blackmarket.Collection.find({
			user_id: this.userId
		});
	}
});

};