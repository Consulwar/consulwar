initResearchServer = function() {

initResearchLib();
initResearchServerMethods();

Game.Research.Collection._ensureIndex({
	user_id: 1
});

Game.Research.add = function(research) {
	Game.Research.initialize();

	var set = {};
	set[research.group + '.' + research.engName] = research.level;

	Game.Research.Collection.update({
		user_id: Meteor.userId()
	}, {
		$set: set
	});

	return set;
};

Game.Research.complete = function(task) {
	Game.Research.add(task);

	Game.Statistic.incrementUser(Meteor.userId(), {
		'research.total': 1
	});
};

Game.Research.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Research.getValue(user._id);

	if (currentValue === undefined) {
		Game.Research.Collection.insert({
			'user_id': user._id
		});
	}
};

Meteor.publish('researches', function () {
	if (this.userId) {
		return Game.Research.Collection.find({user_id: this.userId});
	}
});

};