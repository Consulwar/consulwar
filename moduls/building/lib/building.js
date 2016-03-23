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

		var summ = 0;
		for (var name in this.basePrice) {
			curPrice[name] = Math.floor(this.basePrice[name] * Math.pow(game.PRICE_FACTOR, level));
			summ += curPrice[name];
		}

		curPrice.time = Math.floor(summ / 12);

		// ceil((Кри+Мет) / (250 *   max((10 / МаксЛвл^2) * левел^2, 1)))
		if (level < 10) {
			curPrice['humans'] = Math.ceil(summ / (250 * Math.max((10 / Math.pow(this.maxLevel, 2)) * Math.pow(level, 2), 1)));
		} else {
			curPrice['honor'] = Math.ceil(summ / (250 * Math.max((10 / Math.pow(this.maxLevel, 2)) * Math.pow(level, 2), 1))) * 3;
		}

		Object.defineProperty(curPrice, 'base', {
			value: _.clone(curPrice)
		})

		curPrice = Game.Effect.Price.applyTo(this, curPrice);

		return curPrice;
	}
};
game.extend(game.Building, game.Item);

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
	}
}

initBuildingContent();

}