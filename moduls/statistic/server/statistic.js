initStatisticServer = function() {
	
initStatisticLib();

Game.Statistic.fixGameStatistic = function() {
	var totalMailComplaints = Game.Mail.Collection.find({
		complaint: true
	}).count();

	Game.Statistic.Collection.upsert({
		user_id: 'system'
	}, {
		$set: {
			totalMailComplaints: totalMailComplaints
		}
	});
}

Game.Statistic.fixUserStatistic = function(userId) {
	var user = Meteor.users.findOne({
		_id: userId
	});

	if (!user) {
		throw new Meteor.Error('Пользователь не существует');
	}

	var totalMail = Game.Mail.Collection.find({
		owner: user._id,
		deleted: { $ne: true }
	}).count();

	Game.Statistic.Collection.upsert({
		user_id: user._id
	}, {
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
			return Game.Statistic.Collection.find({
				$or: [
					{ user_id: this.userId },
					{ user_id: 'system' }
				]
			});
		} else {
			return Game.Statistic.Collection.find({
				user_id: this.userId
			});
		}
	}
});

}