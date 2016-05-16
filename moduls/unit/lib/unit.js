initUnitLib = function() {

initBattleLib();

game.Unit = function(options) {
	game.Unit.superclass.constructor.apply(this, arguments);

	if (Game.Unit.items.army[this.side][this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется юнит army ' + this.side + ' ' + this.engName);
	}

	Game.Unit.items.army[this.side][this.engName] = this;

	this.star = function() {
		if (!options.fleetup || !Game.Research.items.fleetups[options.fleetup]) {
			return 0;
		}

		var level = Game.Research.items.fleetups[options.fleetup].currentLevel();
		if (level < 10) {
			return 0;
		} else if (level < 50) {
			return 1;
		} else if (level < 100) {
			return 2;
		} else {
			return 3;
		}
	};

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes[this.type].path(options);
	};

	this.totalCount = function() {
		var armies = Game.Unit.Collection.find({
			user_id: Meteor.userId()
		}).fetch();

		var result = 0;
		for (var i = 0; i < armies.length; i++) {
			if (armies[i].units
			 && armies[i].units.army
			 && armies[i].units.army[this.group]
			 && armies[i].units.army[this.group][this.engName]
			) {
				result += parseInt( armies[i].units.army[this.group][this.engName] );
			}
		}
		return result;
	};

	this.type = 'unit';
	this.side = 'army';
	this.battleEffects = options.battleEffects;
	this.maxCount = options.maxCount;
};
game.extend(game.Unit, game.Item);

game.ReptileUnit = function(options) {
	game.ReptileUnit.superclass.constructor.apply(this, arguments);

	if (Game.Unit.items.reptiles[this.group][this.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется юнит reptiles ' + this.group + ' ' + this.engName);
	}

	Game.Unit.items.reptiles[this.group][this.engName] = this;

	this.url = function(options) {
		options = options || {
			group: this.group,
			item: this.engName
		};
		
		return Router.routes[this.type].path(options);
	};

	this.canBuild = function() {
		return false;
	};

	this.currentLevel = function() {
		return 0;
	};

	this.isEnoughResources = function() {
		return true;
	};

	this.type = 'reptileUnit';
	this.side = 'reptiles';
	this.battleEffects = options.battleEffects;
};
game.extend(game.ReptileUnit, game.Item);

game.ReptileHero = function(options){
	game.ReptileHero.superclass.constructor.apply(this, arguments);

	this.type = 'reptileHero';
};
game.extend(game.ReptileHero, game.ReptileUnit);

game.BattleEffect = function(options) {
	Game.Unit.battleEffects[options.key] = options.func;
};

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

	getArmy: function (id) {
		return Game.Unit.Collection.findOne({
			user_id: Meteor.userId(),
			_id: id
		});
	},

	getHomeArmy: function() {
		return Game.Unit.Collection.findOne({
			user_id: Meteor.userId(),
			location: Game.Unit.location.HOME
		});
	},

	get: function(group, name) {
		var record = Game.Unit.getHomeArmy();

		if (record
		 && record.units
		 && record.units.army
		 && record.units.army[group]
		 && record.units.army[group][name]
		) {
			return record.units.army[group][name];
		} else {
			return 0;
		}
	},

	has: function(group, name, count) {
		count = count || 1;
		return Game.Unit.get(group, name) >= count;
	},

	calcUnitsHealth: function(units) {
		if (!units) {
			return 0;
		}

		var power = 0;
		for (var side in units) {
			for (var group in units[side]) {
				for (var name in units[side][group]) {
					var life = Game.Unit.items[side][group][name].characteristics.life;
					var count = units[side][group][name];
					if (life && count) {
						power += (life * count);
					}
				}
			}
		}
		return power;
	},

	items: {
		army: {
			fleet: {},
			ground: {},
			defense: {}
		},
		reptiles: {
			fleet: {},
			ground: {},
			heroes: {}
		}
	},

	battleEffects: {}
};

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

};