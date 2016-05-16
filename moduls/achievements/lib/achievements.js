initAchievementsLib = function() {

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
		return (achievements && achievements[this.engName]) ? achievements[this.engName] : 0;
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

	if (Game.Achievements.items[options.engName]) {
		throw new Meteor.Error('Ошибка в контенте', 'Дублируется достижение ' + options.engName);
	}

	Game.Achievements.items[options.engName] = this;
};
game.extend(game.Achievement, game.Item);

Game.Achievements = {
	items: {},

	getValue: function() {
		return Meteor.user().achievements;
	},

	getCompleted: function() {
		var result = [];
		var value = Game.Achievements.getValue();

		for (var key in value) {
			if (Game.Achievements.items[key] && value[key] > 0) {
				result.push(Game.Achievements.items[key]);
			}
		}

		return result;
	}
};

initAchievementsContent();

};