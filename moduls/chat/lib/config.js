initChatConfigLib = function() {
  'use strict';

  if (!Meteor.settings.public.chat
   || !Meteor.settings.public.chat.messages
   || !Meteor.settings.public.chat.messages.loadCount
   || !Meteor.settings.public.chat.messages.limit
   || !Meteor.settings.public.chat.messages.freeChatPrice
   || !Meteor.settings.public.chat.room
   || !Meteor.settings.public.chat.room.usersLimit
   || !Meteor.settings.public.chat.room.moderatorsLimit
  ) {
    throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры чата (см. settings.sample public.chat)');
  }

  Game.Chat.Messages.LOAD_COUNT = Meteor.settings.public.chat.messages.loadCount;
  Game.Chat.Messages.LIMIT = Meteor.settings.public.chat.messages.limit;
  Game.Chat.Messages.FREE_CHAT_PRICE = Meteor.settings.public.chat.messages.freeChatPrice;
  Game.Chat.Room.USERS_LIMIT = Meteor.settings.public.chat.room.usersLimit;
  Game.Chat.Room.MODERATORS_LIMIT = Meteor.settings.public.chat.room.moderatorsLimit;

};