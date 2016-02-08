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
		},

		'cheats.generateAllPlanets': function() {
			var galactic = Game.Planets.getBase().galactic;
			for (var i = 0; i < galactic.hands; i++) {
				for (var j = 0; j < galactic.segments; j++) {
					Game.Planets.generateSector(galactic, i, j, true);
				}
			}
		},

		'cheats.addArtefact': function(id, amount) {
			Game.Artefacts.add(id, amount);
		},

		'cheats.removeArtefact': function(id, amount) {
			Game.Artefacts.remove(id, amount);
		},

		'cheats.resetHouseItems': function() {
			Game.House.initialize(Meteor.user(), true);
		},

		'cheats.buyAllHouseItems': function() {
			var items = {};
			var groups = Game.House.items;
			for (var groupKey in groups) {
				items[groupKey] = {};
				for (var itemKey in groups[groupKey]) {
					items[groupKey][itemKey] = {
						isPlaced: (itemKey == 'consul' ? true : false)
					};
				}
			}
			Game.House.Collection.update({
				user_id: Meteor.userId()
			}, {
				$set: { items: items }
			});
		},

		'cheats.resetQuests': function() {
			Game.Quest.initialize(Meteor.user(), true);
		}
	})

} else {

	var addCheater = function() {
		throw new Meteor.Error('Вы добавлены в список читеров, поздравляем!');
	}

	Meteor.methods({
		'cheats.setUnitCount': addCheater,
		'cheats.performBattle': addCheater,
		'cheats.testMissionGenerate': addCheater,
		'cheats.spawnTradeFleet': addCheater,
		'cheats.sendReptileFleetToPlanet': addCheater,
		'cheats.generateAllPlanets': addCheater,
		'cheats.addArtefact': addCheater,
		'cheats.removeArtefact': addCheater,
		'cheats.resetHouseItems': addCheater,
		'cheats.buyAllHouseItems': addCheater,
		'cheats.resetQuests': addCheater
	})

}

}