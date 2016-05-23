initAchievementsClient = function() {

initAchievementsLib();

var isSent = false;

var showAchievement = function (id, level, delay) {
	Meteor.setTimeout(function() {
		Notifications.info(
			'Получено достижение',
			Game.Achievements.items[id].name(level)
		);
	}, delay);
};

Game.Statistic.Collection.find({ user_id: Meteor.userId() }).observeChanges({
	changed: function (id, fields) {
		if (isSent) {
			return;
		}

		var statistic = Game.Statistic.getUser();
		var achievements = Game.Achievements.getValue();

		var completed = null;
		for (var key in Game.Achievements.items) {
			var currentLevel = Game.Achievements.items[key].currentLevel(achievements);
			var progressLevel = Game.Achievements.items[key].progressLevel(statistic);
			if (progressLevel > currentLevel) {
				if (!completed) {
					completed = {};
				}
				completed[key] = progressLevel;
			}
		}

		if (completed) {
			isSent = true;
			Meteor.call('achievements.complete', completed, function (err, result) {
				isSent = false;
				if (result) {
					var delay = 0;
					for (var key in result) {
						showAchievement(key, result[key], delay);
						delay += 1000;
					}
				}
			});
		}
	}
});

};