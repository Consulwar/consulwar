initRatingClient = function() {

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = this.params.page;
	var countOnPage = 20;

	if (pageNumber) {
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		// show required page
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
	} else {
		// redirect to user page
		Meteor.call('rating.getUserPosition', function(err, data) {
			var userPage = (data.total >= data.position)
				? Math.ceil( data.position / countOnPage )
				: 1;

			Router.go('statistics', { page: userPage } );
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
		$('.rating .data')[0].scrollTop = userRow.offsetTop + 200;
	}
});

Template.rating.events({
	'click .send_message': function(e, t) {
		// TODO: implement!
	}
});

}