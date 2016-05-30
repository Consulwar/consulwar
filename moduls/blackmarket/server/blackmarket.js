initBlackmarketServer = function() {

initBlackmarketLib();

Meteor.methods({
	'blackmarket.buyPack': function(id) {
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

		Meteor.call('actualizeGameInfo');

		if (!pack.checkPrice()) {
			throw new Meteor.Error('Невозможно купить сундук');
		}

		// spend resources
		Game.Resources.spend(pack.getPrice());

		// add reward
		var profit = Game.Resources.rollProfit(pack.drop);
		if (profit) {
			Game.Resources.addProfit(profit);
		}

		return profit;
	}
});

};