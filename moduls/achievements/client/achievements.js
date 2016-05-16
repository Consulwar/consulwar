initAchievementsClient = function() {

initAchievementsLib();

Meteor.subscribe('achievements');

Game.Achievements.Collection.find({ user_id: Meteor.userId() }).observeChanges({
	changed: function(id, fields) {
		for (var key in fields) {
			var item = Game.Achievements.items[key];
			var level = fields[key];
			if (item && level) {
				Notifications.success('Получено достижение', item.name(level));
			}
		}
	}
});

};