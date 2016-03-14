initStatisticServer = function() {
	
initStatisticLib();

Game.Statistic.fixGameStatistic = function() {
	var totalMailComplaints = Game.Mail.Collection.find({
		complaint: true
	}).count();

	Game.Statistic.Collection.upsert({}, {
		$set: {
			totalMailComplaints: totalMailComplaints
		}
	});
}

Game.Statistic.fixUserStatistic = function(userId) {
	var user = Meteor.users.find({
		_id: userId
	});

	if (!user) {
		throw new Meteor.Error('Пользователь не существует');
	}

	var totalMail = Game.Mail.Collection.find({
		owner: user._id,
		deleted: { $ne: true }
	}).count();

	Meteor.users.update({ _id: user._id }, {
		$set: {
			totalMail: totalMail
		}
	});
}

Meteor.publish('statistic', function() {
	if (this.userId) {

		var user = Meteor.users.findOne({ _id: this.userId });
		var isAdmin = user && ['admin', 'helper'].indexOf(user.role) >= 0;

		if (isAdmin) {
			return Game.Statistic.Collection.find({}, {
				fields: {
					totalMailComplaints: 1
				}
			});
		}
	}
});

}