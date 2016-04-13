initColosseumLib = function() {

game.ColosseumTournament = function(options) {
	if (Game.Colosseum.tournaments[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется турнир ' + options.engName);
	}

	Game.Colosseum.tournaments[options.engName] = this;

	this.engName = options.engName;
	this.name = options.name;
	this.description = options.description;
	this.level = options.level;
	this.price = options.price;
	this.drop = options.drop;
	this.reward = options.reward;

	this.checkLevel = function() {
		return Game.Building.items.residential.colosseum.currentLevel() >= this.level;
	}

	this.checkPrice = function() {
		var resources = Game.Resources.getValue();
		for (var name in this.price) {
			if (name != 'time' && resources[name].amount < (this.price[name])) {
				return false;
			}
		}
		return true;
	}
}

Game.Colosseum = {
	tournaments: {},

	checkCanStart: function() {
		var user = Meteor.user();
		if (user
		 && user.timeLastTournament
		 && user.timeLastTournament > Game.getCurrentTime() - 86400
		) {
			return false;
		}
		return true;
	},

	getBonusChance: function() {
		return Game.Building.items.residential.colosseum.currentLevel() * 0.1;
	}
}

initColosseumContent();

}