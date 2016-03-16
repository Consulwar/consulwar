Meteor.startup(function () {

Game.Chat = {};

Game.Chat.Messages = {
	LOAD_COUNT: 20,
	LIMIT: 1000,

	Collection: new Meteor.Collection("messages"),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.isChatFree) {
			return null;
		}

		if (user.role && ['admin', 'helper'].indexOf(user.role) != -1) {
			return null;
		}

		if (room && room.isOwnerPays) {
			return { credits: 10 };
		}

		return { crystals: 10 };
	}
};

Game.Chat.Room = {
	USERS_LIMIT: 50,
	MODERATORS_LIMIT: 10,

	Collection: new Meteor.Collection('chatRooms')
};

});