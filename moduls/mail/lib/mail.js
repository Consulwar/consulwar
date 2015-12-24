initMailLib = function () {

game.Mail = {};

game.Mail.status = {
	unread: 0,
	read: 1
};

Game.Mail = {
	Collection: new Meteor.Collection('mail')
};

}