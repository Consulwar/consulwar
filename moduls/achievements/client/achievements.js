initAchievementsClient = function() {

initAchievementsLib();

Meteor.users.find({ _id: Meteor.userId() }).observeChanges({
	changed: function(id, fields) {
		if (!fields.achievements) {
			return;
		}
		for (var key in fields.achievements) {
			var item = Game.Achievements.items[key];
			var level = fields.achievements[key];
			if (item && level) {
				Notifications.success('Получено достижение', item.name(level));
			}
		}
	}
});

};