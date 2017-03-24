initMailLib = function () {
'use strict';

game.Mail = {};

game.Mail.status = {
	unread: 0,
	read: 1
};

game.Mail.complain = {
	canceled: 0,
	senderBlocked: 1,
	recipientBlocked: 2,
	bothBlocked: 3
};

Game.Mail = {
	Collection: new Meteor.Collection('mail'),

	hasUnread: function() {
		return Game.Mail.Collection.findOne({
			status: game.Mail.status.unread,
			to: Meteor.userId()
		});
	},

	userHash: function(userName) {
		return 'compose/' + userName;
	}
};

};