import buzz from 'buzz';
import { Tooltips } from '/moduls/game/client/tooltips';
import '/imports/client/ui/blocks/Puzzle/Chat/PuzzleChat';
import PuzzleCreate from '/imports/client/ui/blocks/Puzzle/Create/PuzzleCreate';

initChatClient = function() {
'use strict';

initChatLib();

var soundNotprepared = new buzz.sound('/sound/notprepared.mp3');

var currentRoomName = null;
var lostConnectionTime = null;
var chatSubscription = null;
var chatRoomSubscription = null;

var hasMore = new ReactiveVar(false);
var isLoading = new ReactiveVar(false);
var isSending = new ReactiveVar(false);
var gotLimit = new ReactiveVar(false);

var messages = new Meteor.Collection(null);
var lastMessage = null;
var firstMessage = null;

var sortMessages = function(messages) {
   return messages.sort(function(a, b) {
      return a.sid - b.sid;
   });
};

var updateScrollbar = _.debounce(() => $('.scrollbar-inner').perfectScrollbar('update'), 10);

var addMessage = function(message, previousMessage) {
   message.showProfile = (
      !previousMessage
      || previousMessage.isMotd
      || message.isMotd
      || message.username != previousMessage.username
      || message.role != previousMessage.role
      || message.iconPath != previousMessage.iconPath
   );

   if (Game.Settings.getOption({ name: 'chatDratuti' })) {
      message.message = 'Дратути';
      message.iconPath = 'exclusive/dratuti';
   }

   messages.upsert(message._id, message);
   Meteor.defer(updateScrollbar);
};

Tracker.autorun((comp) => {
   const user = Meteor.user();
   if (user && user.username && Game.Settings.getOption({ name: 'chatDratuti' })) {
      messages.update(
         {}, 
         {
            $set: {
               message: 'Дратути',
               iconPath: 'exclusive/dratuti',
            }
         },
         { multi: true }
      );
      comp.stop();
   }
});

var addMessagesAfter = function(newMessages, message) {
   addMessage(newMessages[0], message);
   for (var i = 1; i < newMessages.length; i++) {
      addMessage(newMessages[i], newMessages[i - 1]);
   }
};

var updateMoreAvailable = function () {
   hasMore.set(messages.find({ sid: 1 }).count() === 0);
}

var appendMessages = function(newMessages) {
   newMessages = sortMessages(newMessages);
   if (lastMessage && newMessages[newMessages.length - 1].sid <= lastMessage.sid) {
      return;
   }

   if (lastMessage && newMessages[0].sid > lastMessage.sid + 1) {
      newMessages[0].hasMoreHistory = true;
      newMessages[0].previousMessage = lastMessage;
      addMessagesAfter(newMessages, null);
   } else {
      addMessagesAfter(newMessages, lastMessage);
   }
   lastMessage = newMessages[newMessages.length - 1];

   if (!firstMessage) {
      firstMessage = newMessages[0];
   }
   updateMoreAvailable();
};

var prependMessages = function(newMessages) {
   newMessages = sortMessages(newMessages);

   addMessagesAfter(newMessages, null);
   addMessage(firstMessage, newMessages[newMessages.length - 1]);
   firstMessage = newMessages[0];
   updateMoreAvailable();
};

var addMessagesBefore = function(newMessages, message) {
   newMessages = sortMessages(newMessages);
   while (newMessages[0].sid <= message.previousMessage.sid) {
      newMessages.shift();
   }

   newMessages[0].previousMessage = message.previousMessage;
   if (newMessages[0].sid > message.previousMessage.sid + 1) {
      newMessages[0].hasMoreHistory = true;
      addMessagesAfter(newMessages, null);
   }
   else {
      addMessagesAfter(newMessages, message.previousMessage);
   }
   message.hasMoreHistory = false;
   addMessage(message, newMessages[newMessages.length - 1]);
};


Game.Chat.Messages.Collection.find({}).observeChanges({
   added: function(id, message) {
      message._id = id;
      if (chatSubscription.ready())  {  
         addMessage(message, lastMessage);
         lastMessage = message;
         showDesktopNotificationFromMessage(message);
         Meteor.setTimeout(scrollChatToBottom);
      }

      // limit max count
      if (messages.find().count() > Game.Chat.Messages.LIMIT) {
         messages.remove({$gte: {timestamp: firstMessage.timestamp - 60 * 10}});
         firstMessage = messages.findOne({}, {sort: {sid: 1}});
      }
   }
});

var showDesktopNotificationFromMessage = function(message) {
   if (message.message && message.message.indexOf('@' + Meteor.user().username) != -1) {
      const doc = new DOMParser().parseFromString(message.message, 'text/html');
      let text = doc.body.textContent || "";
      Game.showDesktopNotification(text, {
         who: message.username,
         icon: '/img/game/chat/icons/' + message.iconPath + '.png',
         path: Router.path('chat', {group: 'communication', room: currentRoomName})
      });
   }
};

var addMotd = function(message) {
   message.isMotd = true;
   message.timestamp = Session.get('serverTime');
   const lastSid = messages.findOne({}, { fields: { sid: 1 }, sort: { sid: -1 } });
   message.sid = lastSid ? lastSid.sid : 1;

   messages.upsert({isMotd: true}, message);
   lastMessage = message;
   Meteor.setTimeout(scrollChatToBottom);
};

Game.Chat.Room.Collection.find({}).observeChanges({
   added: function(id, room) {
      if (room.motd) {
         addMotd(room.motd);
      }
   },

   changed: function(id, fields) {
      if (fields.motd) {
         addMotd(fields.motd);
      }
   }
});

Game.Chat.showPage = function() {
   this.render('empty', { to: 'content' });
   this.render('empty', { to: 'bottomMenu' });
   if (!currentRoomName) {
      this.render('chat', { to: 'permanent_chat' });
   }
};

Template.chat.onRendered(function() {
   var template = this;

   $(this.find('.messages')).perfectScrollbar();
   $(this.find('.participants')).perfectScrollbar();
   $(this.find('.roomsList')).perfectScrollbar();

   // run this function each time as: 
   // - room changes
   // - connection status changes
   this.autorun(function() {
      // get current server time
      var serverTime = 0;
      Tracker.nonreactive(function() {
         serverTime = Session.get('serverTime');
      });

      // stop previous subscription if has
      if (chatSubscription) {
         chatSubscription.stop();
         chatRoomSubscription.stop();
      }

      // check connection status
      if (Meteor.status().status != 'connected') {
         if (!lostConnectionTime) {
            lostConnectionTime = serverTime;
         }
         return; // connection lost
      }

      // calculate period after connection lost
      var noConnectionPeriod = lostConnectionTime
         ? serverTime - lostConnectionTime
         : 0;

      lostConnectionTime = null;

      // get route room name
      var roomName = Router.current().getParams().room;
      isLoading.set(true);
      if (roomName) {
         if (roomName != currentRoomName // new room
          || messages.length === 0       // or don't have any messages
          || noConnectionPeriod >= 1800  // or lost connection more than 30 min
         ) {
            // reset current room
            messages.remove({});
            hasMore.set(false);
            isSending.set(false);
            gotLimit.set(false);
            firstMessage = null;
            lastMessage = null;


            // set as last active chat room
            Session.set('chatRoom', roomName);
            currentRoomName = roomName;
         }
         // subscribe
         chatSubscription = Meteor.subscribe('chat', roomName, function() {
            isLoading.set(false);
            var messages = Game.Chat.Messages.Collection.find({}).fetch();
            if (messages.length) {
               appendMessages(messages);
            }
            Meteor.setTimeout(scrollChatToBottom.bind(template, true));
            chatRoomSubscription = Meteor.subscribe('chatRoom', roomName);
         });
      }
   });
});

Template.chat.onDestroyed(function() {
   if (chatSubscription) {
      chatSubscription.stop();
      chatRoomSubscription.stop();
   }
});

var scrollChatToBottom = function(force) {
   var container = $('ul.messages');

   if (container && container[0] && (force || (container.height() * 1.5 + container[0].scrollTop) > container[0].scrollHeight)) {
      container[0].scrollTop = container[0].scrollHeight;
   }
};

var createRoom = function(title, url, isPublic, isOwnerPays) {
   if (!title || title.length <= 0) {
      return Notifications.error('Укажите имя комнаты');
   }
   
   if (title.length > 32) {
      return Notifications.error('Максимальная длина имени – 32 символа');
   }

   if (!url || url.length <= 0) {
      return Notifications.error('Укажите URL комнаты');
   }
   
   if (url.length > 32) {
      return Notifications.error('Максимальная длина URL – 32 символа');
   }

   var message = (
      'Создать ' + (isPublic ? 'публичную' : 'приватную') +
      ' комнату с именем «' + title + '» и URL «' + url + '»'
   );

   var price = Game.Chat.Room.getPrice({
      isPublic: isPublic,
      isOwnerPays: isOwnerPays
   });

   if (price && price.credits) {
      message += ' за ' + price.credits + ' ГГК';
   }

   Game.showAcceptWindow(message, function() {
      Meteor.call('chat.createRoom', title, url , isPublic, isOwnerPays, function(err, data) {
         if (err) {
            Notifications.error(err.error);
         } else {
            Notifications.success('Вы успешно создали комнату ' + title);
            Notifications.success(
               'Комната будет доступна по ссылке:',
               Router.path("chat", { room: url })
            );
            loadRoomsList();
            Router.go('chat', { room: url });
         }
      });
   });
};

var removeRoom = function(name) {
   if (!name || name.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   Game.showAcceptWindow('Удалить комнату ' + name, function() {
      Meteor.call('chat.removeRoom', name, function(err, data) {
         if (err) {
            Notifications.error(err.error);
         } else {
            Notifications.success('Вы успешно удалили комнату ' + name);
            Router.go('chat', { room: 'general' });
         }
      });
   });
};

var addCredits = function(roomName, credits) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   credits = parseInt(credits);
   if (!credits || credits < 100) {
      Notifications.error('Минимальная сумма – 100 ГГК');
      return;
   }

   var message = 'Зачислить ' + credits + ' ГГК на счет комнаты ' + roomName;

   Game.showAcceptWindow(message, function() {
      Meteor.call('chat.addCreditsToRoom', roomName, credits, function(err, data) {
         if (err) {
            Notifications.error(err.error);
         } else {
            Notifications.success('Кредиты успешно зачислены на счет комнаты');
            closeBalanceWindow();
         }
      });
   });
};

var addUser = function(roomName, username) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   if (!username || username.length <= 0) {
      Notifications.error('Укажите имя пользователя');
      return;
   }

   Meteor.call('chat.addUserToRoom', roomName, username, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         Notifications.success('Пользователь добавлен в комнату');
      }
   });
};

var removeUser = function(roomName, username) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   if (!username || username.length <= 0) {
      Notifications.error('Укажите имя пользователя');
      return;
   }

   var message = 'Удалить из комнаты ' + roomName + ' пользователя ' + username;

   Game.showAcceptWindow(message, function() {
      Meteor.call('chat.removeUserFromRoom', roomName, username, function(err, data) {
         if (err) {
            Notifications.error(err.error);
         } else {
            Notifications.success('Пользователь удален из комнаты');
         }
      });
   });
};

var blockUser = function(options) {
   if (!options || !options.username || options.username.length <= 0) {
      Notifications.error('Укажите имя пользователя');
      return;
   }

   Meteor.call('chat.blockUser', options, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         if (options.time && options.time > 0) {
            Notifications.success('Пользователь заблокирован');
         } else {
            Notifications.success('Пользователь разблокирован');
         }
      }
   });
};

var addModerator = function(roomName, username) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   if (!username || username.length <= 0) {
      Notifications.error('Укажите имя модератора');
      return;
   }
   Meteor.call('chat.addModeratorToRoom', roomName, username, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         Notifications.success('Модератор назначен');
      }
   });
};

var removeModerator = function(roomName, username) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   if (!username || username.length <= 0) {
      Notifications.error('Укажите имя модератора');
      return;
   }

   Meteor.call('chat.removeModeratorFromRoom', roomName, username, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         Notifications.success('Модератор разжалован');
      }
   });
};

var changeMinRating = function(roomName, minRating) {
   minRating = parseInt(minRating, 10);
   
   if (!roomName || roomName.length <= 0) {
      return Notifications.error('Укажите имя комнаты');
   }

   if (!Match.test(minRating, Match.Integer)) {
      return Notifications.error('Укажите минимальный рейтинг');
   }

   if (minRating < 0) {
      return Notifications.error('Рейтинг не может быть меньше 0');
   }

   Meteor.call('chat.changeMinRating', roomName, minRating, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         Notifications.success('Минимальный рейтинг изменен');
      }
   });
};

var changeDiceModifierForRoom = function(roomName, modifier) {
   if (!roomName || roomName.length <= 0) {
      Notifications.error('Укажите имя комнаты');
      return;
   }

   if (!Match.test(modifier, Match.Integer)) {
      Notifications.error('Укажите модификатор');
      return;
   }

   Meteor.call('chat.changeDiceModifierForRoom', roomName, modifier, function(err, data) {
      if (err) {
         Notifications.error(err.error);
      } else {
         Notifications.success('Модификатор установлен');
      }
   });
};

var execClientCommand = function(message) {
   // show help
   if (message.indexOf('/help') === 0) {
      Game.Chat.showHelpWindow();
      return true;
   }
   // create new channel
   else if (message.indexOf('/create channel') === 0) {
      Game.Chat.showControlWindow();
      return true;
   }
   // remove current channel
   else if (message.indexOf('/remove channel') === 0) {
      removeRoom(Router.current().params.room);
      return true;
   }
   // join existing channel
   else if (message.indexOf('/join') === 0) {
      Router.go('chat', { room: message.substr('/join'.length).trim() });
      return true;
   }
   // add funds to channel
   else if (message.indexOf('/add credits') === 0) {
      addCredits(Router.current().params.room, parseInt(message.substr('/add credits'.length).trim()));
      return true;
   }
   // add user to channel
   else if (message.indexOf('/add user') === 0) {
      addUser(Router.current().params.room, message.substr('/add user'.length).trim());
      return true;
   }
   // remove user from channel
   else if (message.indexOf('/remove user') === 0) {
      removeUser(Router.current().params.room, message.substr('/remove user'.length).trim());
      return true;
   }
   // block user
   else if (message.indexOf('/block') === 0) {
      Game.Chat.showControlWindow( message.substr('/block'.length).trim() );
      return true;
   }
   // unblock user
   else if (message.indexOf('/unblock') === 0) {
      Game.Chat.showControlWindow( message.substr('/block'.length).trim() );
      return true;
   }
   // add moderator
   else if (message.indexOf('/add moderator') === 0) {
      addModerator(Router.current().params.room, message.substr('/add moderator'.length).trim());
      return true;
   }
   // remove moderator
   else if (message.indexOf('/remove moderator') === 0) {
      removeModerator(Router.current().params.room, message.substr('/remove moderator'.length).trim());
      return true;
   }
   // set modifier for dices of room
   else if (message.indexOf('/d mod') === 0) {
      changeDiceModifierForRoom(
         Router.current().params.room, 
         parseInt(message.substr('/d mod'.length).trim())
      );
      return true;
   } else if (message.indexOf('/puzzle') === 0) {
      Game.Popup.show({
         template: (new PuzzleCreate()).renderComponent(),
      });
      return true;
   }

   // command not found
   return false;
};


var isOwner = function(userId) {
   return Game.Chat.Room.Collection.findOne({
      name: Router.current().params.room,
      owner: userId
   });
};

var isModerator = function(username) {
   return Game.Chat.Room.Collection.findOne({
      name: Router.current().params.room,
      moderators: { $in: [ username ] }
   });
};

var canControlRoom = function() {
   if (['admin'].indexOf(Meteor.user().role) != -1) {
      return true;
   }
   return isOwner(Meteor.userId());
};

var canControlUsers = function() {
   return Game.Chat.Room.Collection.findOne({
      name: Router.current().params.room,
      owner: Meteor.userId(),
      isPublic: { $ne: true }
   });
};

var canControlBlock = function() {
   if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
      return true;
   }
   if (isOwner(Meteor.userId()) || isModerator(Meteor.user().username)) {
      return true;
   }
   return false;
};


var getUserRole = function(userId, username, role, rating) {
   if (role && role.id && role.title) {
      return {
         id: role.id,
         name: role.title,
      };
   }

   if (role == 'admin') {
      return {
         id: role,
         name: 'Администратор'
      };
   } else if (role == 'helper') {
      return {
         id: role,
         name: 'Помощник'
      };
   } else if (isOwner(userId)) {
      return {
         id: 'owner',
         name: 'Владелец'
      };
   } else if (isModerator(username)) {
      return {
         id: 'moderator',
         name: 'Модератор'
      };
   }
   return {
      id: '',
      name: Game.User.getLevelName(rating)
   };
};

Template.chatMessage.helpers({
   highlightUser: function(text) {
      if (text.indexOf('/me') === 0) {
         text = text.substr(3);
      }

      return text.replace('@' + Meteor.user().username, '<span class="me">@' + Meteor.user().username + '</span>');
   }
});

Template.chat.helpers({
   freeChatPrice: function() { return Game.Chat.Messages.FREE_CHAT_PRICE; },
   isChatFree: function() { return Meteor.user().isChatFree; },
   maxMessages: function() { return Game.Chat.Messages.LIMIT; },
   isLoading: function() { return isLoading.get(); },
   gotLimit: function() { return gotLimit.get(); },
   hasMore: function() { return hasMore.get(); },
   messages: function() {
      return messages.find({}, { sort: { sid: 1 } });
   },

   getUserRole: function() {
      var user = Meteor.user();
      return getUserRole(user._id, user.username, user.chatTitle || user.role, user.rating);
   },

   getUserRoleByMessage: function(message) {
      return getUserRole(message.user_id, message.username, message.chatTitle || message.role, message.rating);
   },

   room: function() {
      return Game.Chat.Room.Collection.findOne({
         name: Router.current().params.room
      });
   },

   users: function() {
      var roomName = Router.current().params.room;
      var room = Game.Chat.Room.Collection.findOne({
         name: roomName
      });

      if (!room) {
         return null;
      }

      var users = [];
      
      if (!room.isPublic) {

         // private room -> users list
         for (var i = 0; i < room.users.length; i++) {
            users.push({
               name: room.usernames[i],
               role: getUserRole(room.users[i], room.usernames[i]).id
            });
         }

      } else {
         // public room -> find from last messages
         const user = Meteor.user();
         var names = [ user.username ];
         users.push({
            name: user.username,
            role: getUserRole(user._id, user.username, user.chatTitle || user.role).id
         });
         var time = 0;
         Tracker.nonreactive(function() {
            time = Session.get('serverTime') - 1800;
         });

         messages.find({timestamp:{$gt:time}}).forEach(function(message){
            if (names.indexOf(message.username) == -1) {
               names.push(message.username);
               users.push({
                  name: message.username,
                  role: getUserRole(message.user_id, message.username, message.role).id
               });
            }
         });
      }

      if (users.length > 0) {
         return users.sort(function(a, b) {
            if (a.name < b.name) {
               return -1;
            }
            if (a.name > b.name) {
               return 1;
            }
            return 0;
         });
      }

      return null;
   },

   price: function() {
      var room = Game.Chat.Room.Collection.findOne({
         name: Router.current().params.room
      });

      return Game.Chat.Messages.getPrice(room);
   },

   highlightUser: function(text) {
      if (text.indexOf('/me') === 0) {
         text = text.substr(3);
      }

      return text.replace('@' + Meteor.user().username, '<span class="me">@' + Meteor.user().username + '</span>');
   },

   startWith: function(text, value) {
      return (text.substr(0, value.length) == value);
   },

   hideChannels: function() {
      return Session.get('hideChannels', false);
   }
});

Template.chat.events({
   'click': function(e, t) {
      hidePopups();
   },

   'click .toggle': function() {
      Session.set('hideChannels', !Session.get('hideChannels', false));
   },

   'click .dratuti'(e) {
      e.stopPropagation();
      e.preventDefault();
      var roomName = Router.current().params.room;
      Meteor.call('chat.sendMessage', 'Дратути', roomName, (err) => {
         err && Notifications.error('Не получилось отправить сообщение', err.error);
      });
   },

   'submit #message': function(e, t) {
      e.preventDefault();

      if (isSending.get()) {
         return false;
      }

      var roomName = Router.current().params.room;
      var text = t.find('#message textarea[name="text"]').value;

      if (execClientCommand(text)) {
         t.find('#message').reset();
         return false;
      }

      isSending.set(true);
      t.$('input[type="submit"]').attr('disabled', true);

      Meteor.call('chat.sendMessage', text, roomName, function(err, result) {
         isSending.set(false);
         t.$('input[type="submit"]').attr('disabled', false);
         if (err) {
            var errorMessage = err.error;
            if (_.isNumber(err.reason)) {
               errorMessage += ' до ' + Game.Helpers.formatDate(err.reason);
            }
            if (text && text[0] == "/") {
               Notifications.error('Не получилось выполнить команду', errorMessage);
            } else {
               Notifications.error('Не получилось отправить сообщение', errorMessage);
            }
         } else {
            t.find('#message').reset();

            // play sound 'you are not prepared!'
            if (text.indexOf('/яготов') === 0) {
               soundNotprepared.play();
            }
         }
      });

      return false;
   },

   'keypress textarea[name="text"]': function(e, t) {
      if (e.keyCode == 10 || e.keyCode == 13 || e.key == 'Enter') {
         e.preventDefault();
         t.find('#message input[type="submit"]').click();
      }
   },

   'click .messages .message': function(e, t) {
      if (document.getSelection && document.getSelection().toString()) {
         return;
      }
      t.find('#message textarea[name="text"]').value += '@' + $(e.currentTarget).data('username') + ', ';
      t.find('#message textarea[name="text"]').focus();
   },

   'click .messages .message spoiler': function (e, t) {
      if (!$(e.currentTarget).hasClass('disclose')) {
         $(e.currentTarget).addClass('disclose');
         e.stopPropagation();
      }
   },

   'click .messages li.profile, click .participants .online': function(e, t) {
      e.stopPropagation();

      var username = e.currentTarget.dataset.username;
      if (!username || username.length <= 0) {
         return;
      }

      var chatOffset = $('.permanent_chat').offset();
      var zoom = getComputedStyle(document.body).zoom || 1;
      var userPopupWidth = 48 * 4;
      Game.Chat.showUserPopup(
         Math.min(
            e.pageX / zoom - chatOffset.left + 5, 
            $('.permanent_chat').width() - userPopupWidth
         ),
         e.pageY / zoom - chatOffset.top + 5,
         username
      );
   },

   // load previous messages
   'click .chat .more, click .chat .missed': function(e, t) {
      if (isLoading.get()) {
         return;
      }

      var roomName = Router.current().params.room;
      if (!roomName || !messages || !firstMessage) {
         return;
      }

      isLoading.set(true);

      var afterMessageId = e.currentTarget.dataset.messageid;

      var options = {
         roomName: roomName,
         sid: parseInt(e.currentTarget.dataset.sid, 10) || firstMessage.sid,
      };

      const currentRoomNameCache = currentRoomName;
      Meteor.call('chat.loadMore', options, function(err, data) {
         if (currentRoomNameCache !== currentRoomName) {
            return;
         }
         isLoading.set(false);

         if (err) {
            Notifications.error('Не удалось загрузить сообщения', err.error);
            return;
         }

         if (data) {
            if (afterMessageId) {
               var afterMessage = messages.findOne(afterMessageId);
               addMessagesBefore(data, afterMessage);
            } else {
               prependMessages(data);
            }

            if (messages.find().count() >= Game.Chat.Messages.LIMIT) {
               gotLimit.set(true);
            }
         }
      });
   },

   // other chat commands
   'click .buyFreeChat': function(e, t) {
      e.preventDefault();

      Game.showAcceptWindow('Вы точно хотите больше никогда не платить за ссаный чат?', function() {
         var resources = Game.Resources.getValue();
         if (resources.credits.amount < Game.Chat.Messages.FREE_CHAT_PRICE) {
            Notifications.error('Недостаточно средств');
            return;
         }

         Meteor.call('chat.buyFreeChat', function(err, data) {
            if (err) {
               Notifications.error(err.error);
            } else {
               Notifications.success('Ура! Теперь не нужно платить за ссаный чат!');
            }
         });
      });
   },

   'click .addCredits': function(e, t) {
      Game.Chat.showBalanceWindow(Router.current().params.room, 1000);
   },

   'click .dollar': function(e, t) {
      Game.Chat.showIconsWindow();
   },

   'click .info': function(e, t) {
      Game.Chat.showHelpWindow();
   },

   'click .settings': function(e, t) {
      Game.Chat.showControlWindow();
   }
});

var hidePopups = function() {
   hideUserPopup();
};

// ----------------------------------------------------------------------------
// User control popup
// ----------------------------------------------------------------------------

var userPopupView = null;

Game.Chat.showUserPopup = function(x, y, username) {
   hidePopups();
   if (username != Meteor.user().username) {
      userPopupView = Blaze.renderWithData(
         Template.chatUserPopup, {
            x: x,
            y: y,
            username: username
         }, $('.permanent_chat .chat')[0]
      );

      $('.profile').each(function(index, element) {
         if (element.dataset.username == username) {
            $(element).addClass('selected');
         }
      });
   }
};

var hideUserPopup = function() {
   if (userPopupView) {
      Blaze.remove(userPopupView);
      userPopupView = null;

      $('.profile').each(function(index, element) {
         $(element).removeClass('selected');
      });
   }
};

Template.chatUserPopup.onRendered(function() {
   this.$('.rooms').hide();
});

Template.chatUserPopup.helpers({
   canControlBlock: function() { return canControlBlock(); },

   rooms: function() {
      var rooms = roomsList.get();
      if (!rooms) {
         return null;
      }

      var result = [];
      for (var i = 0; i < rooms.length; i++) {
         if (!rooms[i].isPublic && rooms[i].owner == Meteor.userId()) {
            result.push(rooms[i]);
         }
      }

      return result.length > 0 ? result : null;
   },

   canDoKrampusBuff: function() {
      const user = Meteor.user();
      return (
         user
         && user.achievements
         && user.achievements.general
         && user.achievements.general.krampus
         && user.achievements.general.krampus.level >= 2
      );
   }
});

Template.chatUserPopup.events({
   'click .response': function(e, t) {
      $('.chat #message textarea[name="text"]').get(0).value +=  '@' + t.data.username;
   },

   'click .add.active': function(e, t) {
      e.stopPropagation();
      t.$('.rooms').show();
   },

   'click .rooms li': function(e, t) {
      addUser(e.currentTarget.dataset.roomname, t.data.username);
   },

   'click .block.active': function(e, t) {
      Game.Chat.showControlWindow(t.data.username);
   },

   'click .krampus': function(e, t) {
      Meteor.call('chat.sendMessage', '/krampus ' + t.data.username, 'general', (err) => {
         if (err) {
            Notifications.error('Не получилось выполнить команду', err.error);
         }
      });
   },
});

// ----------------------------------------------------------------------------
// Rooms list + popup
// ----------------------------------------------------------------------------

var roomsList = new ReactiveVar(null);
var isAnimation = false;
var isArrowLeft = new ReactiveVar(false);
var isArrowRight = new ReactiveVar(false);

var loadRoomsList = function() {
   Meteor.call('chat.getRoomsList', function(err, data) {
      if (!err) {
         roomsList.set(data);
      }
   });
};

Template.chatRoomsList.onRendered(function() {
   // load rooms list
   if (!roomsList.get()) {
      loadRoomsList();
   }

   // disable arrows
   isArrowLeft.set(false);
   isArrowRight.set(false);

   // each second refresh arrows
   var t = this;
   this.autorun(function() {
      Session.get('serverTime');
      refreshArrows(t);
   });
});

var checkIsRoomVisible = function(roomName) {
   var user = Meteor.user();
   if (user
    && user.settings
    && user.settings.chat
    && user.settings.chat.hiddenRooms
    && user.settings.chat.hiddenRooms.indexOf(roomName) != -1
   ) {
      return false;
   }
   return true;
};

var refreshArrows = function(t) {
   if (t) {
      isArrowLeft.set( canAnimateLeft(t) );
      isArrowRight.set( canAnimateRight(t) );
   }
};

var canAnimateLeft = function(t) {
   var left = parseInt( t.$('ul').css('left') );
   return (left >= 0) ? false : true;
};

var canAnimateRight = function(t) {
   var left = parseInt( t.$('ul').css('left') );
   var contentWidth = 0;
   t.$('ul li').each(function() {
      contentWidth  += $(this).outerWidth(true);
   });
   var containerWidth = t.$('ul').width();
   return (contentWidth + left > containerWidth) ? true : false;
};

Template.chatRoomsList.helpers({
   rooms: function() { return roomsList.get(); },
   isVisible: function(roomName) { return checkIsRoomVisible(roomName); },
   isActive: function(roomName) {
      return Router.current().params.room == roomName;
   },
   isArrowLeft: function() { return isArrowLeft.get(); },
   isArrowRight: function() { return isArrowRight.get(); }
});

Template.chatRoomsList.events({
   'click h2 a': function(e, t) {
      e.stopPropagation();
      $(t.view.parentView.templateInstance().find('.channelList')).toggleClass('hide');
   },

   'click .addChannel': function(e, t) {
      e.stopPropagation();
      $(t.view.parentView.templateInstance().find('.channelCreate')).toggleClass('hide');
   },

   'click .hide': function(e, t) {
      let rooms = {};
      rooms[e.currentTarget.dataset.roomname] = false;
      Meteor.call('chat.setupRoomsVisibility', rooms, function(err, data) {
         if (err) {
            Notifications.error(err.error);
         }
      });
   }
});

var roomsPopupView = null;

Template.channelList.onRendered(function() {
   $(this.find('.channelList')).perfectScrollbar();
});

Template.channelList.helpers({
   rooms: function() { return roomsList.get(); },
   isVisible: function(roomName) { return checkIsRoomVisible(roomName); }
});

Template.channelList.events({
   'click .close': function(e, t) {
      $(t.find('.channelList')).toggleClass('hide');
   },

   'click label': function(e, t) {
      e.stopPropagation();
   },

   'click li': function(e, t) {
      e.stopPropagation();

      $(e.currentTarget).find('input').click();
   },

   'change input': function(e, t) {
      var rooms = {};

      t.$('li').each(function(index, element) {
         rooms[element.dataset.roomname] = $(element).find(':checked').length > 0;
      });

      if (_.keys(rooms).length > 0) {
         Meteor.call('chat.setupRoomsVisibility', rooms, function(err, data) {
            if (err) {
               Notifications.error(err.error);
            }

            Meteor.setTimeout(function() {
               $('.scrollbar-inner').perfectScrollbar('update');
            });
         });
      }
   }
});

// ----------------------------------------------------------------------------
// Help and rules window
// ----------------------------------------------------------------------------

Game.Chat.showHelpWindow = function() {
  Game.Popup.show({ templateName: 'chatHelp' });
};

Template.chatHelp.onRendered(function() {
   this.$('.tabRules').removeClass('active');
   this.$('.rules').hide();
   this.$('.tabCommands').addClass('active');
   this.$('.commands').show();
});

Template.chatHelp.events({
   'click .tabCommands': function(e, t) {
      t.$('.tabRules').removeClass('active');
      t.$('.rules').hide();
      t.$('.tabCommands').addClass('active');
      t.$('.commands').show();
   },

   'click .tabRules': function(e, t) {
      t.$('.tabCommands').removeClass('active');
      t.$('.commands').hide();
      t.$('.tabRules').addClass('active');
      t.$('.rules').show();
   }
});

// ----------------------------------------------------------------------------
// Balance window
// ----------------------------------------------------------------------------

var balanceHistory = new ReactiveVar(null);
var balanceHistoryCount = new ReactiveVar(null);
var balanceLoading = new ReactiveVar(false);

Game.Chat.showBalanceWindow = function(roomName, credits) {
   Game.Popup.show({
     templateName: 'chatBalance', 
     data: {
      currentPage: 1,
      count: 20,
      roomName: roomName,
      credits: credits,
    },
  });
};

var loadBalanceHistory = function(roomName, page, count) {
   if (balanceLoading.get()) {
      return;
   }

   balanceHistory.set(null);
   balanceHistoryCount.set(null);
   balanceLoading.set(true);

   Meteor.call('chat.getBalanceHistory', roomName, page, count, function(err, result) {
      balanceLoading.set(false);
      if (err) {
         Notifications.error('Не удалось загрузить историю пополнения', err.error);
      } else {
         balanceHistory.set(result.data);
         balanceHistoryCount.set(result.count);
      }
   });
};

Template.chatBalance.onRendered(function() {
   loadBalanceHistory(this.data.roomName, this.data.currentPage, this.data.count);
});

Template.chatBalance.helpers({
   count: function() { return this.count; },
   currentPage: function() { return this.currentPage; },
   countTotal: function() { return balanceHistoryCount.get(); },
   history: function() { return balanceHistory.get(); },
   isLoading: function() { return balanceLoading.get(); }
});

Template.chatBalance.events({
   'click .accept': function(e, t) {
      addCredits(t.data.roomName, t.find('input[name="credits"]').value );
   },

   'click .pages a': function(e, t) {
      e.preventDefault();

      var page = parseInt( e.currentTarget.dataset.page, 10 );
      if (page != t.data.currentPage) {
         Tooltips.hide();
         t.data.currentPage = page;
         loadBalanceHistory(t.data.roomName, page, t.data.count);
      }
   }
});

// ----------------------------------------------------------------------------
// Settings and create window
// ----------------------------------------------------------------------------

var createPriceCredits = new ReactiveVar(null);

Game.Chat.showControlWindow = function(username) {
  Game.Popup.show({
    templateName: 'chatControl', 
    data: {
      username: username,
    },
  });
};

var calculateCreatePriceCredits = function(t) {
   var price = Game.Chat.Room.getPrice({
      isPublic: t.find('input[name="roomType"]:checked').value == 'public',
      isOwnerPays: t.find('input[name="roomPayment"]:checked').value == 'credits'
   });

   if (price) {
      createPriceCredits.set(price.credits);
   } else {
      createPriceCredits.set(0);
   }
};


Template.inputWithCounter.onCreated(function(instance) {
   this.counter = new ReactiveVar(parseInt(this.data.max,10));
});

Template.inputWithCounter.helpers({
   counter: function() {
      return Template.instance().counter.get();
   }
});

Template.inputWithCounter.events({
   'keyup input[type="text"], change input[type="text"]': function(e, t) {
      t.counter.set(parseInt(t.data.max) - e.currentTarget.value.length);
      if(t.counter.get() < 0){
         t.$('label').addClass('err');
      } else {
         t.$('label').removeClass('err');
      }
   }
});

Template.channelCreate.onRendered(function() {
   calculateCreatePriceCredits(this);
});

Template.channelCreate.helpers({
   credits: function() { return createPriceCredits.get(); }
});

Template.channelCreate.events({
   'click .close': function(e, t) {
      $(t.find('.channelCreate')).toggleClass('hide');
   },

   'click input[name="roomType"], click input[name="roomPayment"]': function(e, t) {
      calculateCreatePriceCredits(t);
   },

   'click .create': function(e, t) {
      createRoom(
         t.find('input[name="roomTitle"]').value,
         t.find('input[name="roomUrl"]').value,
         t.find('input[name="roomType"]:checked').value == 'public',
         t.find('input[name="roomPayment"]:checked').value == 'credits'
      );
   }
});

Template.chatControl.helpers({
   canControlRoom: function() { return canControlRoom(); },
   canControlUsers: function() { return canControlUsers(); },
   canControlBlock: function() { return canControlBlock(); },

   room: function() {
      return Game.Chat.Room.Collection.findOne({
         name: Router.current().params.room
      });
   },

   isGlobalControl: function() {
      if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
         return true;
      }
      return false;
   }
});

Template.chatControl.events({
   'click .removeRoom:not(.disabled)': function(e, t) {
      removeRoom(Router.current().params.room);
   },

   'click .block:not(.disabled)': function(e, t) {
      var time = parseInt( t.find('input[name="period"]').value * 60 );
      if (!time || time <= 0) {
         Notifications.error('Укажите время блокировки');
         return;
      }

      blockUser({
         roomName: t.find('input[name="blockType"]:checked').value == 'local'
            ? Router.current().params.room
            : null,
         username: t.find('input[name="username"]').value,
         time: time,
         reason: t.find('textarea[name="reason"]').value
      });
   },

   'click .unblock:not(.disabled)': function(e, t) {
      blockUser({
         roomName: t.find('input[name="blockType"]:checked').value == 'local'
            ? Router.current().params.room
            : null,
         username: t.find('input[name="username"]').value,
         time: 0,
         reason: t.find('textarea[name="reason"]').value
      });
   },

   'click .removeUser:not(.disabled)': function(e, t) {
      removeUser(Router.current().params.room, t.find('input[name="username"]').value);
   },

   'click .addModerator:not(.disabled)': function(e, t) {
      addModerator(Router.current().params.room, t.find('input[name="moderatorname"]').value);
   },

   'click .removeModerator:not(.disabled)': function(e, t) {
      removeModerator(Router.current().params.room, t.find('input[name="moderatorname"]').value);
   },

   'click .changeMinRating:not(.disabled)': function(e, t) {
      changeMinRating(Router.current().params.room, t.find('input[name="minRating"]').value);
   }
});

};