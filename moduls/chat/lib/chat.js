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

		var effect = Game.Effect.Special.getValue(true, { engName: 'message' });
		var priceReduction = 1 - effect.price * 0.01;

		return { crystals: Math.ceil(Math.max(
				Math.min(
					Math.floor(Game.Resources.getIncome().crystals / 30), 
					10000), 
				100
			) * priceReduction)
		};
	}
};

Game.Chat.Room = {
	USERS_LIMIT: 50,
	MODERATORS_LIMIT: 10,

	Collection: new Meteor.Collection('chatRooms'),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.role && ['admin'].indexOf(user.role) != -1) {
			return null;
		}

		if (room.isPublic) {
			return room.isOwnerPays ? { credits: 2500 } : { credits: 5000 };
		}

		return room.isOwnerPays ? { credits: 500 } : { credits: 1000 };
	}
};

};