initEarthLib = function() {

Game.Earth = {};

Game.EarthZones = {
	Collection: new Meteor.Collection('zones'),

	getAll: function() {
		return Game.EarthZones.Collection.find();
	}
};



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