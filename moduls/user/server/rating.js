initRatingServer = function() {

Meteor.methods({
	'rating.getPage': function(page, count) {
		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		var result = Meteor.users.find({
			rating: {$gt: 0}
		}, {
			fields: {
				login: 1,
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