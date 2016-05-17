initAchievementsClient = function() {

initAchievementsLib();

Meteor.users.find({ _id: Meteor.userId() }).observeChanges({
	changed: function(id, fields) {
		if (!fields.achievements) {
			return;
		}
		for (var key in fields.achievements) {
			var item = Game.Achievements.items[key];
			var level = fields.achievements[key].level;
			var timestamp = fields.achievements[key].timestamp;
			if (item && level && timestamp >= Session.get('serverTime')) {
				Notifications.info('Получено достижение', item.name(level));
			}
		}
	}
});

};