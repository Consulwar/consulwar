initBuildingsSpecialContainersLib = function() {

game.Container = function(options) {
	if (Game.Containers.items[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется контейнер ' + options.engName);
	}

	Game.Containers.items[options.engName] = this;

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

	this.amount = function() {
		var items = Game.Containers.getValue();
		return (items && items[this.engName] && items[this.engName].amount)
			? items[this.engName].amount
			: 0;
	};
};

Game.Containers = {
	Collection: new Meteor.Collection('containers'),

	items: {},

	getValue: function(uid) {
		return Game.Containers.Collection.findOne({
			user_id: uid === undefined ? Meteor.userId() : uid
		});
	}
};

initBuildingsSpecialContainersContent();

};