initChatLib = function() {

Game.Chat = {};

Game.Chat.Messages = {
	LOAD_COUNT: 20,
	LIMIT: 1000,
	FREE_CHAT_PRICE: 5000,

	Collection: new Meteor.Collection("messages"),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.isChatFree) {
			return null;
		}

		if (user.role && ['admin', 'helper'].indexOf(user.role) != -1) {
			return null;
		}

		if (room) {
			if (room.name == 'help') {
				return null;
			}

			if (room.isOwnerPays) {
				return { credits: 1 };
			}
		}

		return { crystals: 10 };
	}
};

Game.Chat.Room = {
	USERS_LIMIT: 50,
	MODERATORS_LIMIT: 10,

	Collection: new Meteor.Collection('chatRooms'),

	getPrice: function(isPublic) {
		var user = Meteor.user();

		if (user.role && ['admin'].indexOf(user.role) != -1) {
			return null;
		}

		return { credits: isPublic ? 1000 : 500 };
	}
};

}