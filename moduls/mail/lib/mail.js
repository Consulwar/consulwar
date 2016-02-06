initMailLib = function () {

game.Mail = {};

game.Mail.status = {
	unread: 0,
	read: 1
};

Game.Mail = {
	Collection: new Meteor.Collection('mail'),

	hasUnread: function() {
		return Game.Mail.Collection.findOne({
			status: game.Mail.status.unread,
			to: Meteor.userId()
		});
	}
};

}