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
	}
};

Game.EarthTurns = {
	Collection: new Meteor.Collection('turns'),

	getLast: function() {
		return Game.EarthTurns.Collection.findOne({}, {
			sort: { timeEnd: -1 }
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