initUserClient = function() {
'use strict';

Template.votePower.helpers({
	votePower: function() {
		// For reactive update
		var user = Meteor.user();

		return Game.User.getVotePower();
	}
});

var checkUsername = function(t) {
	var username = t.$('.recipient').val();
	if (username && username.length > 0) {
		Meteor.call('user.checkUsernameExists', username, function(err, result) {
			if (!err) {
				t.data.isRecipientOk.set(result);
			}
		});
	} else {
		t.data.isRecipientOk.set(false);
	}
};

Template.inputUsername.onCreated(function() {
	this.data.isRecipientOk = new ReactiveVar(false);
});

Template.inputUsername.helpers({
	isRecipientOk: function() {
		return this.isRecipientOk.get();
	}
});

Template.inputUsername.events({
	'change input, keyup input': _.debounce(function(e, t) {
		checkUsername(t);
	}, 500)
});

};