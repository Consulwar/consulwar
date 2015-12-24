Template.rating.helpers({
	rank: function(rating) {
		return Game.User.getVotePower(rating);
	}
})

Template.rating.onRendered(function() {
	$('.rating')[0].scrollTop = $('#' + Meteor.user().login)[0].offsetTop - 200;
})

Template.rating.events({
	'click .send_message': function(e, t) {

	}
});