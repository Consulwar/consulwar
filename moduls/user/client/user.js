initUserClient = function() {

Template.votePower.helpers({
	votePower: function() {
		// For reactive update
		var user = Meteor.user();

		return Game.User.getVotePower();
	}
});

};