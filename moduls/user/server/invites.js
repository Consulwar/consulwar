Meteor.startup(function() {

Invites = new Meteor.Collection("invites");

Meteor.methods({
	'user.checkInviteCode': function(code) {
		console.log('user.checkInviteCode: ', new Date(), this.connection.clientAddress);

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