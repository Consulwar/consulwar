initAchievementsServer = function() {

initAchievementsLib();

Game.Achievements.actualize = function() {
	var statistic = Game.Statistic.getUser();
	var achievements = Game.Achievements.getValue();

	var set = null;
	for (var key in Game.Achievements.items) {
		var currentLevel = Game.Achievements.items[key].currentLevel(achievements);
		var progressLevel = Game.Achievements.items[key].progressLevel(statistic);
		if (progressLevel > currentLevel) {
			if (!set) {
				set = {};
			}
			set['achievements.' + key] = progressLevel;
		}
	}

	if (set) {
		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$set: set
		});
	}
};

Meteor.methods({
	'achievements.give': function(username, achievementId, level) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
		}

		check(username, String);
		check(achievementId, String);

		if (level) {
			check(level, Match.Integer);
		} else {
			level = 1;
		}

		var target = Meteor.users.findOne({
			username: username
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		if (!Game.Achievements.items[achievementId]) {
			throw new Meteor.Error('Такого достижения нет');
		}

		var set = {};
		set['achievements.' + achievementId] = level;

		Meteor.users.update({
			_id: target._id
		}, {
			$set: set
		});
	}
});

};