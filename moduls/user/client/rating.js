initRatingClient = function() {

Game.Rating = {};

Game.Rating.showPage = function() {
	Meteor.call('rating.getTopUsers', function(err, users) {
		for(var i = 0; i < users.length; i++) {
			users[i].place = i + 1;
		}

		Router.current().render('rating', {
			to: 'content',
			data: {
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
	$('.rating')[0].scrollTop = $('#' + Meteor.user().login)[0].offsetTop - 200;
});

Template.rating.events({
	'click .send_message': function(e, t) {
		// TODO: implement!
	}
});

}