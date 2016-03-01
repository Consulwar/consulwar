initRatingServer = function() {

Meteor.methods({
	'rating.getTopUsers': function() {
		var user = Meteor.user();
		
		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}
		
		return Meteor.users.find({
			rating: {$gt: 0}
		}, {
			fields: {
				login: 1,
				rating: 1,
				cheater: 1
			},
			sort: {rating: -1}
		}).fetch();
	}
});

}