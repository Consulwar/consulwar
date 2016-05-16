initAchievementsServer = function() {

initAchievementsLib();

Game.Achievements.actualize = function() {
	var statistic = Game.Statistic.getUser();
	var achievements = Game.Achievements.getValue();

	if (!achievements) {
		Game.Achievements.Collection.insert({
			user_id: Meteor.userId()
		});
	}

	var set = null;
	for (var key in Game.Achievements.items) {
		var currentLevel = Game.Achievements.items[key].currentLevel(achievements);
		var progressLevel = Game.Achievements.items[key].progressLevel(statistic);
		if (progressLevel > currentLevel) {
			if (!set) {
				set = {};
			}
			set[key] = progressLevel;
		}
	}

	if (set) {
		Game.Achievements.Collection.update({
			user_id: Meteor.userId()
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
		set[achievementId] = level;

		Game.Achievements.Collection.upsert({
			user_id: target._id
		}, {
			$set: set
		});
	}
});

Meteor.publish('achievements', function() {
	if (this.userId) {
		return Game.Achievements.Collection.find({
			user_id: this.userId
		});
	} else {
		this.ready();
	}
});

};