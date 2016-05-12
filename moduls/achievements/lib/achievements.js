initAchievementsLib = function() {

game.Achievement = function(options) {
	this.doNotRegisterEffect = true;

	game.Achievement.superclass.constructor.apply(this, arguments);

	this.type = 'achievement';
	this.currentLevel = options.currentLevel;

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