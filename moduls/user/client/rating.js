initRatingClient = function() {

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var countPerPage = 20;

	if (pageNumber) {
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		// show required page
		Meteor.call('rating.getPage', pageNumber, countPerPage, function(err, data) {
			var skip = (pageNumber - 1) * countPerPage;
			var users = data.users;

			for (var i = 0; i < users.length; i++) {
				users[i].place = skip + i + 1;
			}

			Router.current().render('rating', {
				to: 'content',
				data: {
					countPerPage: countPerPage,
					countTotal: data.count,
					users: users
				}
			});
		});
	} else {
		// redirect to user page
		Meteor.call('rating.getUserPosition', function(err, data) {
			var userPage = (data.total >= data.position)
				? Math.ceil( data.position / countPerPage )
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

}