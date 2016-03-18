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

Game.Statistic.initialize = function(user) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: user._id
	});

	if (!statistic) {
		Game.Statistic.Collection.insert({
			user_id: user._id
		});
	}
}

Game.Statistic.fixUserStatistic = function(userId) {
	var user = Meteor.users.findOne({
		_id: userId
	});

	if (!user) {
		throw new Meteor.Error('Пользователь не существует');
	}

	// mail
	var totalMail = Game.Mail.Collection.find({
		owner: user._id,
		deleted: { $ne: true }
	}).count();

	var totalMailAlltime = Game.Mail.Collection.find({
		owner: user._id
	}).count();

	// payment
	var incomeHistoryCount = Game.Payment.Collection.find({
		user_id: user._id,
		income: true
	}).count();

	var expenseHistoryCount = Game.Payment.Collection.find({
		user_id: user._id,
		income: { $ne: true }
	}).count();

	Game.Statistic.Collection.upsert({
		user_id: user._id
	}, {
		$set: {
			totalMail: totalMail,
			totalMailAlltime: totalMailAlltime,
			incomeHistoryCount: incomeHistoryCount,
			expenseHistoryCount: expenseHistoryCount
		}
	});
}

Meteor.methods({
	'statistic.fixUser': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.Statistic.fixUserStatistic(user._id);
	}
});

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