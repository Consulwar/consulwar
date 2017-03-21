initStatisticAchievementsClient = function() {
'use strict';

initStatisticAchievementsLib();

var isSent = false;

var showAchievement = function (group, id, level, delay) {
	Meteor.setTimeout(function() {
		Notifications.info(
			'Получено достижение',
			Game.Achievements.items[group][id].name(level)
		);
	}, delay);
};

Game.Statistic.Collection.find({ user_id: Meteor.userId() }).observeChanges({
	changed: function () {
		if (isSent) {
			return;
		}

		var statistic = Game.Statistic.getUser();
		var achievements = Game.Achievements.getValue();

		var completed = null;
		for (var group in Game.Achievements.items) {
			for (var key in Game.Achievements.items[group]) {
				var currentLevel = Game.Achievements.items[group][key].currentLevel(achievements);
				var progressLevel = Game.Achievements.items[group][key].progressLevel(statistic);
				if (progressLevel > currentLevel) {
					if (!completed) {
						completed = {};
					}
					if (!completed[group]) {
						completed[group] = {};
					}
					completed[group][key] = progressLevel;
				}
			}
		}

		if (completed) {
			isSent = true;
			Meteor.call('achievements.complete', completed, function (err, result) {
				isSent = false;
				if (result) {
					var delay = 0;
					for (var group in result) {
						for (var key in result[group]) {
							showAchievement(group, key, result[group][key], delay);
							delay += 1000;
						}
					}
				}
			});
		}
	}
});

};