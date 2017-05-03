Meteor.startup(function() {
'use strict';

global.Invites = new Meteor.Collection("invites");

Meteor.methods({
	'user.checkInviteCode': function(code) {
		Game.Log('user.checkInviteCode');

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