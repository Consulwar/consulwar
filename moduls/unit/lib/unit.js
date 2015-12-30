initUnitLib = function() {

game.Unit = function(options){
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

game.ReptileUnit = function(options){
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
	/* userArmy = {
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
	} */

	// groun battle test
	 userArmy = {
		army: {
			ground: {
				fathers: 1,
				horizontalbarman: 1,
				psimans: 1,
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
	}

	options = {
		rounds: 4,
		damageReduction: 0
	}

	Game.Unit.performBattle(userArmy, enemyArmy, options);
}

// ----------------------------------------------------------------------------
// Battle TODO: Move to server!
// ----------------------------------------------------------------------------

var rollCount = function(name) {
	if (_.isNumber(name)) {
		return name;
	}

	switch (name) {
		case 'few':
			return _.random(1, 4);
		case 'several':
			return _.random(5, 9);
		case 'pack':
			return _.random(10, 19);
		case 'lots':
			return _.random(20, 49);
		case 'horde':
			return _.random(50, 99);
		case 'throng':
			return _.random(100, 249);
		case 'swarm':
			return _.random(250, 499);
		case 'zounds':
			return _.random(500, 999);
		case 'legion':
			return _.random(1000, 4999);
		case 'division':
			return _.random(5000, 9999);
		case 'corps':
			return _.random(10000, 19999);
		case 'army':
			return _.random(20000, 49999);
		case 'group':
			return _.random(50000, 99999);
		case 'front':
			return _.random(100000, 249999);
	}
}

var hasAlive = function(units) {
	for (var name in units) {
		if (units[name].life > 0) {
			return true;
		}
	}
	return false;
}

var parseArmyToUnits = function(army) {
	var units = {};

	for (var side in army) {
		for (var group in army[side]) {
			for (var name in army[side][group]) {

				var count = rollCount( army[side][group][name] );
				var model = Game.Unit.items[side][group][name];

				units[ side + '.' + group + '.' + name ] = {
					// constants
					side: side,
					group: group,
					name: name,
					model: model,
					// vars
					count: count,
					life: count * model.characteristics.life
				}

			}
		}
	}

	return units;
}

var fire = function(unit, enemyUnits) {

	if (unit.damage <= 0) return;

	// find targets
	var unitPriorTargets = unit.model.targets();
	var unitPriorTargetsDamage = [0.4, 0.3, 0.2];

	var priorTargets = [];
	var targets = [];

	for (var key in enemyUnits) {

		var enemy = enemyUnits[key];

		if (enemy.life <= 0) continue;
		// TODO: check group

		targets.push(enemy);

		if (unitPriorTargets) {
			for (var i = 0; i < unitPriorTargets.length; i++) {
				if (enemy.side == unitPriorTargets[i].side
				 && enemy.group == unitPriorTargets[i].group
				 && enemy.name == unitPriorTargets[i].engName
				) {
					for (var j = 0; j < i; j++) {
						if (priorTargets.length < j + 1) {
							priorTargets.push(null);
						}
					}
					priorTargets[i] = enemy;
					break;
				}
			}
		}
	}

	// attack priority targets
	if (priorTargets.length > 0) {
		console.log(unit.model.name + ' (' + unit.count + ') атакует приоритетные цели с общим уроном ' + unit.damage);

		var totalDamage = unit.damage;

		for (var i = 0; i < priorTargets.length; i++) {

			var enemy = priorTargets[i];
			if (!enemy || enemy.life <= 0) continue;
			if (i >= unitPriorTargetsDamage.length) continue;

			var appliedDamage = Math.floor( totalDamage * unitPriorTargetsDamage[i] );

			if (appliedDamage < 1) {
				appliedDamage = 1;
			}

			if (enemy.life < appliedDamage) {
				appliedDamage = enemy.life;
				enemy.life = 0;
			} else {
				enemy.life -= appliedDamage;
			}

			unit.damage -= appliedDamage;

			if (enemy.life > 0) {
				console.log('    ' + enemy.model.name + ' получает урон ' + appliedDamage);
			} else {
				console.log('    ' + enemy.model.name + ' получает урон ' + appliedDamage + ' и умирает');
			}

			if (unit.damage <= 0) return;
		}
	}

	// attack rest targets
	if (targets.length > 0) {

		console.log(unit.model.name + ' (' + unit.count + ') атакует оставшимся уроном ' + unit.damage);

		for (var i = 0; i < targets.length; i++) {

			var enemy = targets[i];
			if (enemy.life <= 0) continue;

			var appliedDamage = Math.floor( unit.damage / (targets.length - i) );

			if (appliedDamage < 1) {
				appliedDamage = 1;
			}

			if (enemy.life < appliedDamage) {
				appliedDamage = enemy.life;
				enemy.life = 0;
			} else {
				enemy.life -= appliedDamage;	
			}

			unit.damage -= appliedDamage;

			if (enemy.life > 0) {
				console.log('    ' + enemy.model.name + ' получает урон ' + appliedDamage);
			} else {
				console.log('    ' + enemy.model.name + ' получает урон ' + appliedDamage + ' и умирает');
			}

			if (unit.damage <= 0) break;
		}
	}
}

var performRound = function(userUnits, enemyUnits, round, damageReduction) {

	console.log('----------------------');
	console.log('Раунд ' + round);
	console.log('----------------------');
	
	// calculate damage
	for (var key in userUnits) {
		if (userUnits[key].model.characteristics.damage) {
			var min = userUnits[key].model.characteristics.damage.min;
			var max = userUnits[key].model.characteristics.damage.max;
			var damage = _.random( min, max ) * damageReduction; 
			userUnits[key].damage = damage;
		} else {
			userUnits[key].damage = 0;
		}
	}

	for (var key in enemyUnits) {
		if (enemyUnits[key].model.characteristics.damage) {
			var min = enemyUnits[key].model.characteristics.damage.min;
			var max = enemyUnits[key].model.characteristics.damage.max;
			var damage = _.random( min, max ) * damageReduction; 
			enemyUnits[key].damage = damage;
		} else {
			enemyUnits[key].damage = 0;
		}
	}

	// attack
	for (var key in userUnits) {
		fire( userUnits[key], enemyUnits );
	}

	console.log('----------------------');

	for (var key in enemyUnits) {
		fire( enemyUnits[key], userUnits);
	}

	console.log('----------------------');

	// calculate round results
	var userKilled = {};

	for (var key in userUnits) {
		var unitsLeft = Math.ceil( userUnits[key].life / userUnits[key].model.characteristics.life );
		var unitsKilled = userUnits[key].count - unitsLeft;

		userUnits[key].count = unitsLeft;
		userKilled[key] = unitsKilled;
	}

	console.log('Наши потери:');
	for (var key in userKilled) {
		if (userKilled[key] > 0) {
			console.log('    ' + userUnits[key].model.name + ' = ' + userKilled[key]);
		}
	}

	var enemyKilled = {};

	for (var key in enemyUnits) {
		var unitsLeft = Math.ceil( enemyUnits[key].life / enemyUnits[key].model.characteristics.life );
		var unitsKilled = enemyUnits[key].count - unitsLeft;

		enemyUnits[key].count = unitsLeft;
		enemyKilled[key] = unitsKilled;
	}

	console.log('Вражеские потери:');
	for (var key in enemyKilled) {
		if (enemyKilled[key] > 0) {
			console.log('    ' + enemyUnits[key].model.name + ' = ' + enemyKilled[key]);
		}
	}

	return {
		userKilled: userKilled,
		enemyKilled: enemyKilled
	}
}

Game.Unit.performBattle = function(userArmy, enemyArmy, options) {

	// parse options
	var rounds = (options && options.rounds) ? options.rounds : 4;

	var damageReduction = (options && options.damageReduction) ? options.damageReduction : 0;
	if (damageReduction < 0) {
		damageReduction = 0;
	} else if (damageReduction > 99) {
		damageReduction = 99;
	}
	damageReduction = 1 - damageReduction / 100

	// parse user army
	var userUnits = parseArmyToUnits( userArmy );

	// parse enemy army
	var enemyUnits = parseArmyToUnits( enemyArmy );

	// perform battle
	var isFinished = false;
	var round = 1;

	while (!isFinished) {

		performRound(userUnits, enemyUnits, round, damageReduction);

		if (hasAlive(userUnits) && hasAlive(enemyUnits) && round < rounds) {
			round++;
		} else {
			isFinished = true;
		}
	}

	// show results
	console.log('----------------------');
	console.log('Бой закончен');
	console.log('----------------------');

	console.log('Наша армия:');
	var userArmyRest = null;

	for (var key in userUnits) {

		var unit = userUnits[key];
		console.log('    ' + unit.model.name + ' ' + unit.count);

		if (unit.count > 0) {
			if (!userArmyRest)                        userArmyRest = {};
			if (!userArmyRest[unit.side])             userArmyRest[unit.side] = {};
			if (!userArmyRest[unit.side][unit.group]) userArmyRest[unit.side][unit.group] = {};

			userArmyRest[unit.side][unit.group][unit.name] = unit.count;
		}
	}

	console.log('Вражеская армия:');
	var enemyArmyRest = null;
	
	for (var key in enemyUnits) {

		var unit = enemyUnits[key];
		console.log('    ' + unit.model.name + ' ' + unit.count);

		if (unit.count > 0) {
			if (!enemyArmyRest)                        enemyArmyRest = {};
			if (!enemyArmyRest[unit.side])             enemyArmyRest[unit.side] = {};
			if (!enemyArmyRest[unit.side][unit.group]) enemyArmyRest[unit.side][unit.group] = {};

			enemyArmyRest[unit.side][unit.group][unit.name] = unit.count;
		}
	}

	return {
		userArmy: userArmyRest,
		enemyArmy: enemyArmyRest
	}
}



// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------



}