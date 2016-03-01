initRatingClient = function() {

Game.Rating = {};

Game.Rating.showPage = function() {

	var countOnPage = 20;

	var pageNumber = (this.params.page)
		? this.params.page
		: 1;

	Meteor.call('rating.getPage', pageNumber, countOnPage, function(err, data) {
		var skip = (pageNumber - 1) * countOnPage;
		var users = data.users;

		for (var i = 0; i < users.length; i++) {
			users[i].place = skip + i + 1;
		}

		Router.current().render('rating', {
			to: 'content',
			data: {
				currentPage: pageNumber,
				countOnPage: countOnPage,
				countTotal: data.count,
				users: users
			}
		});
	});
}

Template.rating.helpers({
	rank: function(rating) {
		return Game.User.getVotePower(rating);
	}
});

Template.rating.onRendered(function() {
	// $('.rating')[0].scrollTop = $('#' + Meteor.user().login)[0].offsetTop - 200;
});

Template.rating.events({
	'click .send_message': function(e, t) {
		// TODO: implement!
	}
});

}