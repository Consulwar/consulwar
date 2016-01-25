initEarthLib = function() {

Game.Earth = {};

Game.EarthZones = {
	Collection: new Meteor.Collection('zones'),

	getAll: function() {
		return Game.EarthZones.Collection.find();
	},

	getByName: function(name) {
		return Game.EarthZones.Collection.findOne({
			name: name
		});
	},

	getCurrent: function() {
		return Game.EarthZones.Collection.findOne({
			isCurrent: true
		});
	},

	calcUnitsPower: function(units) {
		var power = 0;
		if (units) {
			for (var side in units) {
				for (var group in units[side]) {
					for (var name in units[side][group]) {
						var life = Game.Unit.items[side][group][name].characteristics.life;
						var count = units[side][group][name];
						power += (life * count);
					}
				}
			}
		}
		return power;
	},

	calcTotalPower: function(isEnemy) {
		var power = 0;
		var zones = Game.EarthZones.getAll().fetch();
		for (var i = 0; i < zones.length; i++) {
			power += Game.EarthZones.calcUnitsPower( isEnemy ? zones[i].enemyArmy : zones[i].userArmy );
		}
		return power;
	}
};

Game.EarthTurns = {
	Collection: new Meteor.Collection('turns'),

	getLast: function() {
		return Game.EarthTurns.Collection.findOne({}, {
			sort: { timeStart: -1 }
		});
	}
}

game.PointType = function(options) {
	this.constructor = function(options) {
		this.name = options.name;
		this.engName = options.engName;

		this.effects = options.effects;

		Game.Point.types.items[this.engName] = this;
	}

	this.constructor(options);
}

game.Point = function(options) {
	this.constructor = function(options) {
		this.engName = options.engName;

		this.type = options.type;

		Game.Point.items[this.engName] = this;
	}

	this.constructor(options);
}

Game.Point = {
	Collection: new Meteor.Collection('points'),

	getValue: function(name) {
		return Game.Point.Collection.findOne({
			name: name
		});
	},

	types: {
		items: {}
	},
	items: {}
}

initGalacticContentEarth();

}