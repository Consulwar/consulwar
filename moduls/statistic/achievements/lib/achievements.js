initStatisticAchievementsLib = function() {
'use strict';

game.Achievement = function(options) {
	this.doNotRegisterEffect = true;

	game.Achievement.superclass.constructor.apply(this, arguments);

	this.type = 'achievement';
	this.field = options.field;
	this.levels = options.levels;

	this.progressLevel = (function(statistic) {
		if (!this.field || !this.levels) {
			return 0;
		}

		var value = Game.Statistic.getUserValue(this.field, statistic);
		for (var i = 0; i < this.levels.length; i++) {
			if (value < this.levels[i]) {
				return i;
			}
		}
		return i;
	}).bind(this);

	this.currentLevel = (function(achievements) {
		if (achievements === undefined) {
			achievements = Game.Achievements.getValue();
		}
		if (achievements
		 && achievements[this.group]
		 && achievements[this.group][this.engName]
		 && achievements[this.group][this.engName].level
		) {
			return achievements[this.group][this.engName].level;
		}
		return 0;
	}).bind(this);
	
	this.nextLevel = (function (achievements) {
		var currentLevel = this.currentLevel(achievements);
		if (currentLevel < this.maxLevel()) {
			return currentLevel + 1;
		}
		return 0;
	}).bind(this);

	this.maxLevel = (function () {
		return (options.levels) ? options.levels.length : 1;
	}).bind(this);

	this.name = (function(level) {
		if (_.isArray(options.name)) {
			level = (level !== undefined) ? level : this.currentLevel();
			return options.name[ Math.max(level - 1, 0) ];
		} else {
			return options.name;
		}
	}).bind(this);

	this.description = (function(level) {
		if (_.isArray(options.description)) {
			level = (level !== undefined) ? level : this.currentLevel();
			return options.description[ Math.max(level - 1, 0) ];
		} else {
			return options.description;
		}
	}).bind(this);

	if (Game.Achievements.items[options.group][options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется достижение ' + options.group + ' ' + options.engName);
	}

	Game.Achievements.items[options.group][options.engName] = this;
};
game.extend(game.Achievement, game.Item);

Game.Achievements = {
	items: {
		general: {},
		science: {},
		cosmos: {},
		battle: {},
		communication: {}
	},

	getValue: function() {
		var user = Meteor.user();
		return user && user.achievements;
	},

	getCompleted: function() {
		var result = [];
		var value = Game.Achievements.getValue();

		for (var group in value) {
			for (var key in value[group]) {
				if (Game.Achievements.items[group][key]
				 && value[group]
				 && value[group][key]
				 && value[group][key].level > 0
				) {
					result.push(Game.Achievements.items[group][key]);
				}
			}
		}

		return result;
	}
};

initAchievementsContent();
};