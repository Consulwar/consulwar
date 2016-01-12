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

		var homePlanet = Game.Planets.getBase();
		if (homePlanet) {
			// refresh home planet
			homePlanet.timeRespawn = Math.floor( new Date().valueOf() / 1000 );
			Game.Planets.update(homePlanet);
		}
	},

	'cheats.performBattle': function(userArmy, enemyArmy, options) {
		var result = Game.Unit.performBattle(userArmy, enemyArmy, options);
		return result.log;
	},

	'cheats.testMissionGenerate': function (planet) {
		return Game.Planets.generateMission(planet);
	},

	'cheats.spawnTradeFleet': function() {
		Game.SpaceEvents.spawnTradeFleet();
	},

	'cheats.sendReptileFleetToPlanet': function(planetId) {
		Game.SpaceEvents.sendReptileFleetToPlanet(planetId);
	}
})

} else {

var addCheater = function() {
	throw new Meteor.Error('Вы добавлены в список читеров, поздравляем');
}

Meteor.methods({
	'cheats.setUnitCount': addCheater,
	'cheats.performBattle': addCheater,
	'cheats.testMissionGenerate': addCheater,
	'cheats.spawnTradeFleet': addCheater,
	'cheats.sendReptileFleetToPlanet': addCheater
})

}

}