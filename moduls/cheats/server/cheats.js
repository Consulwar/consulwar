initCheatsServer = function() {

if (process.env.NODE_ENV == 'development') {

Meteor.methods({
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