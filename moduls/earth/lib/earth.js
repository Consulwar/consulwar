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

	calcUnitsHealth: function(units) {
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

	calcTotalHealth: function(isEnemy) {
		var userPower = 0;
		var enemyPower = 0;

		var zones = Game.EarthZones.getAll().fetch();
		for (var i = 0; i < zones.length; i++) {
			userPower += Game.EarthZones.calcUnitsHealth( zones[i].userArmy );
			enemyPower += Game.EarthZones.calcUnitsHealth( zones[i].enemyArmy );
		}

		return {
			userPower: userPower,
			enemyPower: enemyPower
		}
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

}