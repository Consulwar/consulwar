initChatConfigServer = function() {

	if (!Meteor.settings.chat
	 || !Meteor.settings.chat.messages
	 || !Meteor.settings.chat.messages.subscribeLimit
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры чата (см. settings.sample chat)');
	}

	Game.Chat.Messages.SUBSCRIBE_LIMIT = Meteor.settings.chat.messages.subscribeLimit;

};