initRatingClient = function() {

Game.Rating = {};

var showRatingPage = function(pageNumber, countOnPage) {
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

Game.Rating.showPage = function() {
	var countOnPage = 20;

	if (this.params.page) {
		// show required page
		showRatingPage(this.params.page, countOnPage);
	} else {
		// show user page
		Meteor.call('rating.getUserPosition', function(err, data) {
			var userPage = (data.total >= data.position)
				? Math.ceil( data.position / countOnPage )
				: 1;

			showRatingPage(userPage, countOnPage);
		})
	}
}

Template.rating.helpers({
	rank: function(rating) {
		return Game.User.getVotePower(rating);
	}
});

Template.rating.onRendered(function() {
	var userRow = $('#' + Meteor.user().login)[0];
	if (userRow) {
		$('.rating .data')[0].scrollTop = userRow.offsetTop;
	}
});

Template.rating.events({
	'click .send_message': function(e, t) {
		// TODO: implement!
	}
});

}