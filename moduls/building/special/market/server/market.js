initBuildingSpecialMarketServer = function() {
'use strict';

initBuildingSpecialMarketLib();

Meteor.methods({
	'market.exchange': function(resourceFrom, resourceTo, amount) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		Game.Log.method('market.exchange');

		var userResources = Game.Resources.getValue();

		if (!userResources[resourceFrom]
		 || !userResources[resourceFrom].amount
		 ||  userResources[resourceFrom].amount < amount
		) {
			throw new Meteor.Error('Недостаточно ресурсов');
		}

		var result = Game.Building.special.Market.getExchangeAmount(resourceFrom, resourceTo, amount);

		if (result <= 0) {
			throw new Meteor.Error('Невозможно совершить обмен');
		}

		var resourceSpend = {};
		resourceSpend[resourceFrom] = amount;
		Game.Resources.sold(resourceSpend);

		var resourceAdd = {};
		resourceAdd[resourceTo] = result;
		Game.Resources.bought(resourceAdd);
	}
});

};