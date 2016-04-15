initEarthLib = function() {

Game.Earth = {
	checkReinforceTime: function(currentTime) {
		var hours = new Date(currentTime * 1000).getHours();
		return (hours >= 17 && hours < 19) ? false : true;
	}
};

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
		if (!units) {
			return 0;
		}

		var power = 0;
		for (var side in units) {
			for (var group in units[side]) {
				for (var name in units[side][group]) {
					var life = Game.Unit.items[side][group][name].characteristics.life;
					var count = units[side][group][name];
					if (life && count) {
						power += (life * count);
					}
				}
			}
		}
		return power;
	},

	calcMaxHealth: function() {
		var max = 0;
		var zones = Game.EarthZones.getAll().fetch();
		for (var i = 0; i < zones.length; i++) {
			// calc user army
			var userHealth = Game.EarthZones.calcUnitsHealth( zones[i].userArmy );
			if (userHealth > max) {
				max = userHealth;
			}
			// calc enemy army
			var enemyHealth = Game.EarthZones.calcUnitsHealth( zones[i].enemyArmy );
			if (enemyHealth > max) {
				max = enemyHealth;
			}
		}
		return max;
	}
};

Game.EarthTurns = {
	Collection: new Meteor.Collection('turns'),

	getLast: function() {
		return Game.EarthTurns.Collection.findOne({}, {
			sort: { timeStart: -1 }
		});
	}
};

};