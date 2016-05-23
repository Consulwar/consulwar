initMarketServer = function() {

initMarketLib();

Meteor.methods({
	'market.exchange': function(resourceFrom, resourceTo, amount) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var userResources = Game.Resources.getValue();

		if (!userResources[resourceFrom] || userResources[resourceFrom].amount < amount) {
			throw new Meteor.Error('Недостаточно ресурсов');
		}

		var result = Game.Market.getExchangeAmount(resourceFrom, resourceTo, amount);

		if (!result) {
			throw new Meteor.Error('Невозможно совершить обмен');
		}

		var resourceSpend = {};
		resourceSpend[resourceFrom] = amount;
		Game.Resources.spend(resourceSpend);

		var resourceAdd = {};
		resourceAdd[resourceTo] = result;
		Game.Resources.add(resourceAdd);
	}
});

};