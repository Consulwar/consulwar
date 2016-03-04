Meteor.startup(function () {

Game.Chat = {
	MESSAGE_AMOUNT: 200,
	MESSAGE_LIMIT: 1000,

	Collection: new Meteor.Collection("messages"),

	getMessagePrice: function() {
		var user = Meteor.user();

		if (user.role && ['admin', 'helper'].indexOf(user.role) != -1) {
			return 0;
		}

		//var messageEffect = Game.Effect.Special.getRelatedTo({engName: 'message'});
		//var priceReduction = messageEffect && messageEffect[2] && messageEffect[2].price && messageEffect[2].price.length ? (1 - (messageEffect[2].price[0].value / 100)) : 1;

		return 10;/*Math.ceil(Math.max(
			Math.min(
				Math.floor(Game.Resources.getIncome().crystals / 30), 
				10000), 
			100
		) * priceReduction);*/
	}
};

Game.ChatRoom = {
	Collection: new Meteor.Collection('chatRooms')
};

});