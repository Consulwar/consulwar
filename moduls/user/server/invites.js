Meteor.startup(function() {

Invites = new Meteor.Collection("invites");

Meteor.methods({
	checkInviteCode: function(code) {
		check(code, String);
		var invite = Invites.findOne({code: code});
		if (invite) {
			return invite._id;
		} else {
			return false;
		}
	}
});

});