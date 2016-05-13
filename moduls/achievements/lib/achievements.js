initAchievementsLib = function() {

game.Achievement = function(options) {
	this.doNotRegisterEffect = true;

	game.Achievement.superclass.constructor.apply(this, arguments);

	this.type = 'achievement';
	this.field = options.field;
	this.levels = options.levels;

	this.maxLevel = function() {
		return this.levels.length;
	};
	this.maxLevel = this.maxLevel.bind(this);

	this.currentLevel = function() {
		var value = Game.Statistic.getUserValue(this.field);
		for (var i = 0; i < this.levels.length; i++) {
			if (value < this.levels[i]) {
				return i;
			}
		}
		return i;
	};
	this.currentLevel = this.currentLevel.bind(this);

	this.currentProgress = function() {
		return Game.Statistic.getUserValue(this.field);
	};
	this.currentProgress = this.currentProgress.bind(this);

	this.name = function(level) {
		if (_.isArray(options.name)) {
			level = (level !== undefined) ? level : this.currentLevel();
			return options.name[ Math.max(level - 1, 0) ];
		} else {
			return options.name;
		}
	};
	this.name = this.name.bind(this);

	this.description = function(level) {
		if (_.isArray(options.description)) {
			level = (level !== undefined) ? level : this.currentLevel();
			return options.description[ Math.max(level - 1, 0) ];
		} else {
			return options.description;
		}
	};
	this.description = this.description.bind(this);

	if (Game.Achievements.items[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется достижение ' + options.engName);
	}

	Game.Achievements.items[options.engName] = this;
};
game.extend(game.Achievement, game.Item);

Game.Achievements = {
	items: {},

	getCompleted: function() {
		var result = [];
		for (var key in Game.Achievements.items) {
			if (Game.Achievements.items[key].currentLevel() > 0) {
				result.push(Game.Achievements.items[key]);
			}
		}
		return result;
	}
};

initAchievementsContent();

};