initBuildingLib = function() {

game.Building = function(options){
	game.Building.superclass.constructor.apply(this, arguments);

	this.type = 'building';

	if (Game.Building.items[this.group][this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется здание ' + this.group + ' ' + this.engName);
	}
	
	Game.Building.items[this.group][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		return Router.routes[this.type].path(options);
	}

	this.price = function(level) {
		var curPrice = {};
		// Цена идет на подъем ДО указаного уровня с предыдущего
		// т.к. начальный уровень нулевой, то цена для первого уровня
		// является ценой подъема с нулевого до первого
		level = level ? level - 1 : this.currentLevel();

		var basePrice = this.basePrice(level);
		var sum = 0
		for (var name in basePrice) {
			curPrice[name] = basePrice[name][1].call(
				this,
				level,
				basePrice[name][0],
				basePrice[name][2]
			);
			sum += curPrice[name];
		}

		if (!curPrice.time) {
			curPrice.time = Math.floor(summ / 12);
		}

		Object.defineProperty(curPrice, 'base', {
			value: _.clone(curPrice)
		})

		curPrice = Game.Effect.Price.applyTo(this, curPrice);

		return curPrice;
	}
};
game.extend(game.Building, game.Item);

game.BuildingFunction = function(options) {
	Game.Building.functions[options.key] = options.func;
}

Game.Building = {
	Collection: new Meteor.Collection('buildings'),

	getValue: function() {
		return Game.Building.Collection.findOne({user_id: Meteor.userId()});
	},

	get: function(group, name) {
		var buildings = Game.Building.getValue();

		if (buildings && buildings[group] && buildings[group][name]) {
			return buildings[group][name];
		} else {
			return 0;
		}
	},

	has: function(group, name, level) {
		level = level || 1;
		return Game.Building.get(group, name) >= level;
	},

	items: {
		residential: {},
		military: {}
	},

	functions: {}
}

initBuildingContent();

}