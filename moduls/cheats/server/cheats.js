initCheatsServer = function() {

if (process.env.NODE_ENV == 'development') {

Meteor.methods({
	'cheats.setUnitCount': function(group, name, count) {
		var set = {};
		set['units.army.' + group + '.' + name] = count; 

		Game.Unit.initialize();
		Game.Unit.Collection.update({
			user_id: Meteor.userId(),
			location: Game.Unit.location.HOME
		}, {
			$set: set
		})
	},

	'cheats.performBattle': function(userArmy, enemyArmy, options) {
		var result = Game.Unit.performBattle(userArmy, enemyArmy, options);
		return result.log;
	},

	'cheats.testMissionGenerate': function (planet) {
		return Game.Planets.generateMission(planet);
	}
})

}

}