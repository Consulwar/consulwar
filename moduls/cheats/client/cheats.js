initCheatsClient = function() {

Game.Cheats = {}

// ----------------------------------------------------------------------------
// Unit cheats
// ----------------------------------------------------------------------------

Game.Cheats.setUnitCount = function (group, name, count) {
	Meteor.call('cheats.setUnitCount', group, name, count);
}

Game.Cheats.testBattle = function() {
	// fleet battle test
	userArmy = {
		army: {
			fleet: {
				wasp: 1000,
				cruiser: 500,
				battleship: 1,
				carrier: 1,
				flagship: 1
			}
		}
	}
	enemyArmy = {
		reptiles: {
			fleet: {
				blade: 100,
				dragon: 20,
				hydra: 10,
				armadillo: 1,
				shadow: 1,
				trioniks: 1
			}
		}
	}

	// ground battle test
	/* userArmy = {
		army: {
			ground: {
				fathers: 1,
				horizontalbarman: 1,
				psimans: 2,
				agmogedcar: 1,
				easytank: 1,
				mothertank: 1,
				prickartillery: 1,
				fast: 1,
				grandmother: 1,
				relax: 1,
				lost: 1,
				hbhr: 1
			}
		}
	}
	enemyArmy = {
		reptiles: {
			ground: {
				striker: 1,
				ripper: 1,
				horror: 1,
				breaker: 1,
				slider: 1,
				crusher: 1,
				geccon: 1,
				amfizben: 1,
				amphibian: 1,
				chipping: 1,
				toofucking: 1,
				patron: 1
			}
		}
	} */

	options = {
		rounds: 3,
		damageReduction: 0,
		missionType: 'patrolfleet',
		missionLevel: 1
	}

	Meteor.call('cheats.performBattle', userArmy, enemyArmy, options, function(err, data) {
		console.log(data);
	});
}

// ----------------------------------------------------------------------------
// Cosmos cheats
// ----------------------------------------------------------------------------

Game.Cheats.testMissionGenerate = function(hand, segment) {
	var planet = {
		segment: segment,
		hand: hand
	}

	Meteor.call('cheats.testMissionGenerate', planet, function (err, data) {
		console.log(data);
	});
}

Game.Cheats.spawnTradeFleet = function() {
	Meteor.call('cheats.spawnTradeFleet');
}

Game.Cheats.sendReptileFleetToPlanet = function(planetName) {
	var planet = Game.Planets.Collection.findOne({ name: planetName });
	if (planet) {
		Meteor.call('cheats.sendReptileFleetToPlanet', planet._id);
	}
}

Game.Cheats.generateAllPlanets = function() {
	Meteor.call('cheats.generateAllPlanets');
}

// ----------------------------------------------------------------------------
// Artefacts cheats
// ----------------------------------------------------------------------------

Game.Cheats.addArtefact = function(id, amount) {
	Meteor.call('cheats.addArtefact', id, amount);
}

Game.Cheats.removeArtefact = function(id, amount) {
	Meteor.call('cheats.removeArtefact', id, amount);
}

}