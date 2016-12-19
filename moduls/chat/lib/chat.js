initChatLib = function() {

Game.Chat = {};

Game.Chat.Messages = {
	Collection: new Meteor.Collection('messages'),

	getPrice: function(room) {
		var user = Meteor.user();

		if (user.isChatFree) {
			return null;
		}

		if (user.role && ['admin', 'helper'].indexOf(user.role) != -1) {
			return null;
		}

		if (room) {
			if (room.isFree) {
				return null;
			}

			if (room.isOwnerPays) {
				return { credits: 1 };
			}
		}

		var income = Math.floor(Game.Resources.getIncome().crystals / 30);
		var basePrice = { 
			crystals: Math.ceil(Math.max(Math.min(income, 10000), 100))
		};
		var price = Game.Effect.Price.applyTo({ engName: 'message' }, basePrice, true);
		if (!price || !price.crystals) {
			return null;
		}

		return price;
	}
};

Game.Chat.Room = {
	
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


initChatConfigLib();

};