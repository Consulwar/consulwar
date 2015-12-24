initUnitLib = function() {

game.Unit = function(options){
	game.Unit.superclass.constructor.apply(this, arguments);

	Game.Unit.items['army'][this.side][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes['unit'].path(options);
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
		
		return Router.routes['reptileUnit'].path(options);
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

/*game.GlobalUnit = function(options){
	game.GlobalUnit.superclass.constructor.apply(this, arguments);

	Game.Unit.items[
		this.menu == 'army' ? 'army' : 'reptiles'
	][
		this.side == 'heroes' 
			? 'ground' 
			: this.side == 'rheroes'
				? 'rground'
				: this.side
	][this.engName] = this;

	//this.type = 'globalUnit';
};
game.extend(game.GlobalUnit, game.GlobalItem)*/
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
game.extend(game.Hero, game.GlobalItem)
*/
Game.Unit = {
	Collection: new Meteor.Collection('units'),

	getValue: function() {
		return Game.Unit.Collection.findOne({user_id: Meteor.userId()});
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
}