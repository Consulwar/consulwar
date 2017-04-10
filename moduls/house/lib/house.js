initHouseLib = function() {
'use strict';

game.HouseItem = function(options) {
	this.doNotRegisterEffect = true;

	game.HouseItem.superclass.constructor.apply(this, arguments);

	this.type = 'house';
	this.subgroup = options.subgroup;
	this.isUnique = options.isUnique;

	this.overlay = this.overlay || {
		x: 0, 
		y: 0,
		z: 0
	}

	this.overlay.levels = this.overlay.levels || [1];

	switch (this.subgroup) {
		case 'room':
			this.overlay.z = 0;
			this.overlay.type = 'jpg';
			break;
		case 'tron':
			this.overlay.z = 1;
			break;
		case 'avatar':
			this.overlay.z = 2;
			break;
	}

	if (Game.House.items[this.subgroup][this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется предмет палаты консула ' + this.subgroup + ' ' + this.engName);
	}

	Game.House.items[this.subgroup][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			subgroup: this.subgroup,
			item: this.engName
		};
		return Router.routes[this.type].path(options);
	};

	this.icon = function() {
		return '/img/game/house/' + this.subgroup + '/i/' + this.engName + '.png';
	};

	this.image = function() {
		return '/img/game/house/' + this.subgroup + '/i/' + this.engName + '.jpg';
	};

	this.getPrice = function() {
		return options.price;
	};

	this.checkBought = function() {
		var house = Game.House.getValue();
		if (house
		 && house.items
		 && house.items[this.subgroup]
		 && house.items[this.subgroup][this.engName]
		) {
			return true;
		}
		return false;
	};

	this.checkPlaced = function() {
		var house = Game.House.getValue();
		if (house
		 && house.items
		 && house.items[this.subgroup]
		 && house.items[this.subgroup][this.engName]
		 && house.items[this.subgroup][this.engName].isPlaced
		) {
			return true;
		}
		return false;
	};

	this.canBuy = function() {
		var price = this.getPrice();
		if (!price) {
			return false;
		}

		var resources = Game.Resources.getValue();
		for (var name in price) {
			if (name != 'time' && resources[name].amount < (price[name])) {
				return false;
			}
		}

		return true;
	};
};
game.extend(game.HouseItem, game.Item);

Game.House = {
	Collection: new Meteor.Collection('houseItems'),

	getValue: function() {
		return Game.House.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	get: function(group, id) {
		var house = Game.House.getValue();

		if (house && house.items && house.items[group] && house.items[group][id]) {
			return 1;
		} else {
			return null;
		}
	},

	getPlacedItems: function() {
		var placed = [];
		var house = Game.House.getValue();
		
		if (house) {
			for (var group in house.items) {
				for (var id in house.items[group]) {
					if (house.items[group][id].isPlaced) {
						placed.push( Game.House.items[group][id] );
					}
				}
			}
		}

		return placed;
	},

	items: {
		room: {},
		tron: {},
		avatar: {}
	}
};

initHouseContent();
};