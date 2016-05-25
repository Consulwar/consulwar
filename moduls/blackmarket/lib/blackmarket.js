initBlackmarketLib = function() {

game.BlackmarketPack = function(options) {
	if (Game.Blackmarket.items[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется сундук на черном рынке ' + options.engName);
	}

	Game.Blackmarket.items[options.engName] = this;

	this.engName = options.engName;
	this.name = options.name;
	this.description = options.description;
	this.price = options.price;
	this.drop = options.drop;

	this.getPrice = function() {
		return Game.Effect.Price.applyTo({ engName: 'containerPrice' }, _.clone(options.price), true);
	};

	this.checkPrice = function() {
		var price = this.getPrice();
		var resources = Game.Resources.getValue();
		for (var name in price) {
			if (name != 'time' && resources[name].amount < (price[name])) {
				return false;
			}
		}
		return true;
	};
};

Game.Blackmarket = {
	items: {}
};

initBlackmarketContent();

};