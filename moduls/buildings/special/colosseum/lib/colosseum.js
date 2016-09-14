initBuildingsSpecialColosseumLib = function() {

game.ColosseumTournament = function(options) {
	if (Game.Building.special.Colosseum.tournaments[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется турнир ' + options.engName);
	}

	Game.Building.special.Colosseum.tournaments[options.engName] = this;

	this.engName = options.engName;
	this.name = options.name;
	this.description = options.description;
	this.level = options.level;
	this.price = options.price;
	this.drop = options.drop;

	this.checkLevel = function() {
		return Game.Building.items.residential.colosseum.currentLevel() >= this.level;
	};

	this.checkPrice = function() {
		var resources = Game.Resources.getValue();
		for (var name in this.price) {
			if (name != 'time' && resources[name].amount < (this.price[name])) {
				return false;
			}
		}
		return true;
	};
};

Game.Building.special.Colosseum = {
	tournaments: {},

	getCooldownPeriod: function(level) {
		return 86400 - ( (level - 1) * 580 ); // 24 hours - bonus time
	},

	checkCanStart: function() {
		var user = Meteor.user();
		var level = Game.Building.items.residential.colosseum.currentLevel();

		if (user
		 && user.timeLastTournament
		 && user.timeLastTournament > Game.Building.special.getCurrentTime() - Game.Building.special.Colosseum.getCooldownPeriod(level)
		) {
			return false;
		}

		return true;
	}
};

initBuildingsSpecialColosseumContent();

};