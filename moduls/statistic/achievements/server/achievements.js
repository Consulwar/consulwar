initStatisticAchievementsServer = function() {

initStatisticAchievementsLib();

Meteor.methods({
	'achievements.complete': function(completed) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('achievements.complete: ', new Date(), user.username);

		var statistic = Game.Statistic.getUser();
		var achievements = Game.Achievements.getValue();

		var result = null;
		var set = null;

		for (var key in completed) {
			if (!Game.Achievements.items[key]) {
				continue;
			}

			var currentLevel = Game.Achievements.items[key].currentLevel(achievements);
			var progressLevel = Game.Achievements.items[key].progressLevel(statistic);

			if (completed[key] == progressLevel && progressLevel > currentLevel) {
				if (!set) {
					set = {};
					result = {};
				}

				set['achievements.' + key + '.level'] = progressLevel;
				set['achievements.' + key + '.timestamps.' + progressLevel] = Game.getCurrentTime();

				result[key] = progressLevel;
			}
		}

		if (set) {
			Meteor.users.update({
				_id: Meteor.userId()
			}, {
				$set: set
			});
		}

		return result;
	},

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

		console.log('achievements.give: ', new Date(), user.username);

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
		set['achievements.' + achievementId] = {
			level: level,
			timestamp: Game.getCurrentTime()
		};

		Meteor.users.update({
			_id: target._id
		}, {
			$set: set
		});
	}
});

};