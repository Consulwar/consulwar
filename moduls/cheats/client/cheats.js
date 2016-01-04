initCheatsClient = function() {

Game.Cheats = {}

Game.Cheats.testBattle = Game.Unit.testBattle = function() {
	// fleet battle test
	userArmy = {
		army: {
			fleet: {
				wasp: 1,
				cruiser: 1,
				battleship: 1,
				carrier: 1,
				flagship: 1
			}
		}
	}
	enemyArmy = {
		reptiles: {
			fleet: {
				blade: 1,
				dragon: 1,
				hydra: 1,
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
		rounds: 4,
		damageReduction: 0
	}

	Meteor.call('cheats.performBattle', userArmy, enemyArmy, options, function(err, data) {
		console.log(data);
	});
}

}