initCheatsClient = function() {
'use strict';

Game.Cheats = {};

// ----------------------------------------------------------------------------
// Unit cheats
// ----------------------------------------------------------------------------

Game.Cheats.setUnitCount = function (group, name, count) {
	Meteor.call('cheats.setUnitCount', group, name, count);
};

Game.Cheats.testBattle = function() {
	// fleet battle test
	let userArmy = {
		army: {
			fleet: {
				gammadrone: 100,
				wasp: 50,
				mirage: 40,
				frigate: 30,
				truckc: 20,
				cruiser: 10,
				battleship: 9,
				carrier: 8,
				dreadnought: 6,
				railgun: 4,
				reaper: 2,
				flagship: 1
			},
			defense: {
				bomb: 100,
				ionbomb: 50,
				turret: 40,
				laserturret: 30,
				snipergun: 20,
				railcannon: 10,
				plasmakiller: 9,
				tyrant: 8,
				crystalgun: 6,
				trilinear: 4,
				deforbital: 2,
				doomsdaygun: 1
			}
		}
	};
	let enemyArmy = {
		reptiles: {
			fleet: {
				sphero: 100,
				blade: 50,
				lacertian: 40,
				wyvern: 30,
				trioniks: 20,
				dragon: 10,
				hydra: 9,
				armadillo: 8,
				prism: 6,
				octopus: 4,
				godzilla: 2,
				shadow: 100
			}
		}
	};

	userArmy = {
		army: {
			fleet: {
				gammadrone: 100,
				wasp: 50,
				mirage: 40,
				cruiser: 10
			}
		}
	};
	enemyArmy = {
		reptiles: {
			fleet: {
				sphero: 100,
				blade: 50,
				lacertian: 40
			}
		}
	};


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
	};
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
	}; */

	let options = {
		rounds: 3,
		damageReduction: 0,
		missionType: 'patrolfleet',
		missionLevel: 1
	};

	Meteor.call('cheats.performBattle', userArmy, enemyArmy, options, function(err, data) {
		console.log(data);
	});
};

// ----------------------------------------------------------------------------
// Cosmos cheats
// ----------------------------------------------------------------------------

Game.Cheats.testMissionGenerate = function(hand, segment) {
	var planet = {
		segment: segment,
		hand: hand
	};

	Meteor.call('cheats.testMissionGenerate', planet, function (err, data) {
		console.log(data);
	});
};

Game.Cheats.spawnTradeFleet = function(hand, segment) {
	Meteor.call('cheats.spawnTradeFleet', hand, segment);
};

Game.Cheats.sendReptileFleetToPlanet = function(planetName) {
	var planet = Game.Planets.Collection.findOne({ name: planetName });
	if (planet) {
		Meteor.call('cheats.sendReptileFleetToPlanet', planet._id);
	}
};

Game.Cheats.generateAllPlanets = function() {
	Meteor.call('cheats.generateAllPlanets');
};

// ----------------------------------------------------------------------------
// Resource, building and research cheats
// ----------------------------------------------------------------------------

Game.Cheats.addResource = function(id, amount) {
	Meteor.call('cheats.addResource', id, amount);
};

Game.Cheats.spendResource = function(id, amount) {
	Meteor.call('cheats.spendResource', id, amount);
};

Game.Cheats.addCard = function(id, amount) {
	Meteor.call('cheats.addCard', id, amount);
};

Game.Cheats.spendCard = function(id, amount) {
	Meteor.call('cheats.spendCard', id, amount);
};

Game.Cheats.setBuildingLevel = function(group, name, level) {
	Meteor.call('cheats.setBuildingLevel', group, name, level);
};

Game.Cheats.setResearchLevel = function(group, name, level) {
	Meteor.call('cheats.setResearchLevel', group, name, level);
};

Game.Cheats.setMutualLevel = function(group, name, level) {
	Meteor.call('cheats.setMutualLevel', group, name, level);
};

// ----------------------------------------------------------------------------
// Consul house cheats
// ----------------------------------------------------------------------------

Game.Cheats.resetHouseItems = function() {
	Meteor.call('cheats.resetHouseItems');
};

Game.Cheats.buyAllHouseItems = function() {
	Meteor.call('cheats.buyAllHouseItems');
};

// ----------------------------------------------------------------------------
// Quest cheats
// ----------------------------------------------------------------------------

Game.Cheats.resetQuests = function() {
	Meteor.call('cheats.resetQuests');
};

Game.Cheats.completeQuests = function() {
	Meteor.call('cheats.completeQuests');
};

};