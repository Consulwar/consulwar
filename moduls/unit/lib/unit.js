initUnitLib = function() {

game.Unit = function(options) {
	game.Unit.superclass.constructor.apply(this, arguments);

	Game.Unit.items['army'][this.side][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes[this.type].path(options);
	}

	this.type = 'unit';
	this.side = 'army';
};
game.extend(game.Unit, game.Item);

game.ReptileUnit = function(options) {
	game.ReptileUnit.superclass.constructor.apply(this, arguments);

	Game.Unit.items['reptiles'][this.group][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes[this.type].path(options);
	}

	this.canBuild = function(count) {
		return false;
	}

	this.currentLevel = function() {
		return 0;
	}

	this.type = 'reptileUnit';
	this.side = 'reptiles';
};
game.extend(game.ReptileUnit, game.Item)


game.ReptileHero = function(options){
	game.ReptileHero.superclass.constructor.apply(this, arguments);

	this.type = 'reptileHero';
};
game.extend(game.ReptileHero, game.ReptileUnit)

/*game.MutualUnit = function(options){
	game.MutualUnit.superclass.constructor.apply(this, arguments);

	Game.Unit.items[
		this.menu == 'army' ? 'army' : 'reptiles'
	][
		this.side == 'heroes' 
			? 'ground' 
			: this.side == 'rheroes'
				? 'rground'
				: this.side
	][this.engName] = this;

	//this.type = 'mutualUnit';
};
game.extend(game.MutualUnit, game.MutualItem)*/
/*
game.Hero = function(options){
	game.Hero.superclass.constructor.apply(this, arguments);

	Game.Unit.items['army'][
		this.side == 'heroes' 
			? 'ground' 
			: this.side == 'rheroes'
				? 'rground'
				: this.side
	][this.engName] = this;

	this.group = 'hero';
	//this.type = 'hero';
};
game.extend(game.Hero, game.MutualItem)
*/
Game.Unit = {

	location: {
		HOME: 1,
		PLANET: 2,
		SHIP: 3
	},

	Collection: new Meteor.Collection('units'),

	getValue: function() {
		return Game.Unit.Collection.findOne({
			user_id: Meteor.userId(),
			location: Game.Unit.location.HOME
		});
	},

	get: function(group, name) {
		var units = Game.Unit.getValue();

		if (units && units[group] && units[group][name]) {
			return units[group][name];
		} else {
			return 0;
		}
	},

	has: function(group, name, count) {
		count = count || 1;
		return Game.Unit.get(group, name) >= count;
	},

	items: {
		army: {
			fleet: {},
			ground: {}
		},
		reptiles: {
			fleet: {},
			ground: {},
			heroes: {}
		}
	},

	battleEffects: {

		psi: function(unit, friends, enemies, round, options) {
			// check round
			if (round != 'before') {
				return false;
			}
			// get effect power
			var power = 0;
			var psieffect = Game.Mutual.get('research', 'psieffect');
			if (psieffect <= 0) {
				power = ( 1 + Math.round( Math.random() * 4 ) ) / 100;
			} else {
				power = ( 6 + Math.round( Math.random() * 4 ) ) / 100;
			}
			power *= options.damageReduction;
			// count psi enemies
			var psiCount = 0;
			for (var key in enemies) {
				if (enemies[key].model.engName == 'psimans'
				 || enemies[key].model.engName == 'horror'
				) {
					psiCount += enemies[key].startCount;
				}
			}
			// if psi equal, idle
			if (psiCount == unit.startCount) {
				return unit.model.name + ' ничего не может сделать';
			}
			// apply effect
			var message = unit.model.name + ' атакует ';
			for (var key in enemies) {
				var canAttack = true;
				// if our psi count lower, attack only psi units
				if (psiCount > unit.startCount
				 && enemies[key].model.engName != 'psimans'
				 && enemies[key].model.engName != 'horror'
				) {
					canAttack = false;
				}
				// attack
				if (canAttack) {
					var appliedDamage = Math.floor( enemies[key].life * power );
					enemies[key].life -= appliedDamage;
					message += enemies[key].model.name + ' (-' + appliedDamage + ') ';
				}
			}
			return message;
		}

	}
}

initUnitsContent();
/*
for (var category in Game.Unit.items.army) {
	for (var name in Game.Unit.items.army[category]) {
		Game.Unit.items.army[category][name].targetsNames = [];

		if (Game.Unit.items.army[category][name].targets == undefined) {
			continue;
		}

		for (var i = 0; i < Game.Unit.items.army[category][name].targets.length; i++) {
			Game.Unit.items.army[category][name].targetsNames.push(
				Game.Unit.items.reptiles[category][Game.Unit.items.army[category][name].targets[i]].name
			)
		}
	}
}

for (var category in Game.Unit.items.reptiles) {
	for (var name in Game.Unit.items.reptiles[category]) {
		Game.Unit.items.reptiles[category][name].targetsNames = [];

		if (Game.Unit.items.reptiles[category][name].targets == undefined) {
			continue;
		}

		for (var i = 0; i < Game.Unit.items.reptiles[category][name].targets.length; i++) {
			Game.Unit.items.reptiles[category][name].targetsNames.push(
				Game.Unit.items.army[category.substr(1)][Game.Unit.items.reptiles[category][name].targets[i]].name
			)
		}
	}
}
*/

Game.Unit.testBattle = function() {
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

	Meteor.call('unit.performBattle', userArmy, enemyArmy, options, function(err, data) {
		console.log(data);
	});
}

}