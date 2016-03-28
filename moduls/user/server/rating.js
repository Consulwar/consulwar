initRatingServer = function() {

Meteor.methods({
	'rating.getUserPosition': function() {
		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		var position = Meteor.users.find({
			rating: { $gt: user.rating }
		}, {
			fields: {
				username: 1,
				rating: 1,
				cheater: 1
			},
			sort: {rating: -1}
		}).count();

		var total = Meteor.users.find({
			rating: { $gt: 0 }
		}, {
			fields: {
				username: 1,
				rating: 1,
				cheater: 1
			},
			sort: {rating: -1}
		}).count();

		return {
			total: total,
			position: position
		}
	},

	'rating.getPage': function(page, count) {
		check(page, Match.Integer);
		check(count, Match.Integer);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		var result = Meteor.users.find({
			rating: { $gt: 0 }
		}, {
			fields: {
				username: 1,
				rating: 1,
				cheater: 1
			},
			sort: {rating: -1},
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		});

		return {
			users: result.fetch(),
			count: result.count()
		}
	}
});

}