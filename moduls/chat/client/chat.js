initChatClient = function() {

initChatLib();

var soundNotprepared = new buzz.sound('/sound/notprepared.mp3');

var currentRoomName = null;
var lostConnectionTime = null;
var chatSubscription = null;
var chatRoomSubscription = null;

var messages = new ReactiveArray();
var hasMore = new ReactiveVar(true);
var isLoading = new ReactiveVar(false);
var isSending = new ReactiveVar(false);
var gotLimit = new ReactiveVar(false);

var addMessage = function(message) {
	var i = 0;
	var n = messages.length;
	var isDuplicated = false;

	while (n-- > 0) {
		// check if duplicated
		if (messages[n]._id == message._id) {
			isDuplicated = true;
			break;
		}
		// find position
		if (i === 0 && messages[n].timestamp <= message.timestamp) {
			i = n + 1;
		}
		// break check
		if (messages[n].timestamp < message.timestamp) {
			break;
		}
	}

	if (!isDuplicated) {
		messages.splice(i, 0, message);
	}
};

Game.Chat.Messages.Collection.find({}).observeChanges({
	added: function(id, message) {
		message._id = id;
		addMessage(message);

		// limit max count
		while (messages.length > Game.Chat.Messages.LIMIT) {
			messages.shift();
		}

		// scroll to bottom
		Meteor.setTimeout(scrollChatToBottom);
	}
});

var addMotd = function(message) {
	message.isMotd = true;
	message.timestamp = Session.get('serverTime');

	var hasSame = false;
	var n = messages.length;

	while (n-- > 0) {
		if (messages[n].isMotd) {
			if (messages[n].message == message.message) {
				// found same motd, no need to push current
				hasSame = true;
			} else {
				// found different motd, remove it
				messages[n].splice(n, 1);
			}
			break;
		}
	}

	if (!hasSame) {
		// no such motd, add current
		messages.push(message);
		Meteor.setTimeout(scrollChatToBottom);
	}
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
	this.render('chat', { to: 'content' });
};

Template.chat.onRendered(function() {
	Meteor.setTimeout(scrollChatToBottom.bind(this, true));

	// run this function each time as: 
	// - room changes
	// - connection status changes
	this.autorun(function() {
		// stop previous subscription if has
		if (chatSubscription) {
			chatSubscription.stop();
			chatRoomSubscription.stop();
		}

		// check connection status
		if (Meteor.status().status != 'connected') {
			if (!lostConnectionTime) {
				lostConnectionTime = Game.getCurrentTime();
			}
			return; // connection lost
		}

		// calculate period after connection lost
		var noConnectionPeriod = lostConnectionTime
			? Game.getCurrentTime() - lostConnectionTime
			: 0;

		lostConnectionTime = null;
		
		// get route room name
		var roomName = Router.current().getParams().room;

		if (roomName) {
			if (roomName != currentRoomName // new room
			 || messages.length === 0        // or don't have any messages
			 || noConnectionPeriod >= 3600  // or lost connection more than 30 min
			) {
				// reset current room
				messages.clear();
				hasMore.set(true);
				isLoading.set(false);
				isSending.set(false);
				gotLimit.set(false);
				
				// subscribe
				chatRoomSubscription = Meteor.subscribe('chatRoom', roomName);
				chatSubscription = Meteor.subscribe('chat', roomName);

				// set as last active chat room
				Session.set('chatRoom', roomName);
				currentRoomName = roomName;
			} else {
				// load after last message timestamp
				isLoading.set(true);

				var options = {
					roomName: roomName,
					timestamp: messages[ messages.length - 1 ].timestamp
				};

				Meteor.call('chat.loadMore', options, function(err, data) {
					isLoading.set(false);
					// insert loaded messages
					if (!err && data) {
						for (var i = 0; i < data.length; i++) {
							addMessage(data[i]);
						}
						while (messages.length > Game.Chat.Messages.LIMIT) {
							messages.shift();
						}
					}
					// subscribe after loading
					chatRoomSubscription = Meteor.subscribe('chatRoom', roomName);
					chatSubscription = Meteor.subscribe('chat', roomName);
				});
			}
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

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 50) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
};

var createRoom = function(name, isPublic, isOwnerPays) {
	var message = 'Имя комнаты: ' +  name + '\n'
	            + 'Тип комнаты: ' + (isPublic ? 'публичная' : 'приватная') + '\n'
	            + 'Оплата сообщений: ' + (isOwnerPays ? 'ГГК' : 'кристаллы' );

	var price = Game.Chat.Room.getPrice({
		isPublic: isPublic,
		isOwnerPays: isOwnerPays
	});

	if (price && price.credits) {
		message += '\n' + 'Стоимость создания: ' + price.credits + ' ГГК';
	}

	if (confirm(message)) {
		Meteor.call('chat.createRoom', name, isPublic, isOwnerPays, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Вы успешно создали комнату ' + name);
				Router.go('chat', { room: name });
			}
		});
	}
};

var removeRoom = function(name) {
	Meteor.call('chat.removeRoom', name, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Вы успешно удалили комнату ' + name);
			Router.go('chat', { room: 'general' });
		}
	});
};

var addCredits = function(roomName, credits) {
	credits = parseInt( credits, 10 );
	if (credits <= 0) {
		Notifications.error('Укажите сумму кредитов!');
		return;
	}

	Meteor.call('chat.addCreditsToRoom', roomName, credits, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Кредиты успешно зачисленны на счет комнаты');
		}
	});
};

var addUser = function(roomName, username) {
	Meteor.call('chat.addUserToRoom', roomName, username, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Пользователь добавлен в комнату');
		}
	});
};

var removeUser = function(roomName, username) {
	Meteor.call('chat.removeUserFromRoom', roomName, username, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Пользователь удален из комнаты');
		}
	});
};

var blockUser = function(options) {
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
	Meteor.call('chat.addModeratorToRoom', roomName, username, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Модератор назначен');
		}
	});
};

var removeModerator = function(roomName, username) {
	Meteor.call('chat.removeModeratorFromRoom', roomName, username, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Модератор разжалован');
		}
	});
};

var execClientCommand = function(message) {
	// show help
	if (message.indexOf('/help') === 0) {
		var helpText = ''
		 + 'Доступные команды:' + '\n'
		 + '/create channel - создать комнату' + '\n'
		 + '/remove channel - удалить текущую комнату' + '\n'
		 + '/join [channel] - присоединиться к комнате' + '\n'
		 + '/add credits [amount] - пополнить баланс комнаты' + '\n'
		 + '/add user [username] - добавить пользователя к комнате' + '\n'
		 + '/remove user [username] - удалить пользователя из комнаты' + '\n'
		 + '/block [username] - наказать пользователя' + '\n'
		 + '/unblock [username] - простить пользователя' + '\n'
		 + '/add moderator [username] - назначить модератора' + '\n'
		 + '/remove moderator [username] - разжаловать модератора' + '\n'
		 + '/d [n] [m] - бросить n кубиков с m гранями' + '\n'
		 + '/me [text] - писать от третьего лица' + '\n'
		 + '/сепукку - совершить сепукку и пожертвовать ресурсы' + '\n'
		 + '/яготов - вы действительно так думаете?';
		
		alert(helpText);
		return true;
	}
	// create new channel
	else if (message.indexOf('/create channel') === 0) {
		var name = prompt('Введите название комнаты');
		if (!name) {
			return true;
		}

		var isPublic = confirm('Комната будет публичной?');
		var isOwnerPays = confirm('Сообщения оплачиваются грязными галлактическими кредитами?');

		createRoom(name, isPublic, isOwnerPays);
		return true;
	}
	// remove current channel
	else if (message.indexOf('/remove channel') === 0) {
		if (confirm('Вы действительно хотите удалить текущую комнату?')) {
			removeRoom(Router.current().params.room);
		}
		return true;
	}
	// join existing channel
	else if (message.indexOf('/join') === 0) {
		Router.go('chat', { room: message.substr('/join'.length).trim() });
		return true;
	}
	// add funds to channel
	else if (message.indexOf('/add credits') === 0) {
		addCredits(Router.current().params.room, message.substr('/add credits'.length).trim());
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
		var time = prompt('Укажите время блокировки в секундах', '86400');
		if (!time) {
			return;
		}

		var isLocalBlock = true;
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			isLocalBlock = confirm('Блокировать только эту комнату?');
		}

		blockUser({
			roomName: isLocalBlock ? Router.current().params.room : null,
			username: message.substr('/block'.length).trim(),
			time: parseInt(time, 10)
		});
		return true;
	}
	// unblock user
	else if (message.indexOf('/unblock') === 0) {
		var isLocalUnblock = true;
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			isLocalUnblock = confirm('Разблокировать только эту комнату?');
		}

		blockUser({
			roomName: isLocalUnblock ? Router.current().params.room : null,
			username: message.substr('/unblock'.length).trim(),
			time: 0
		});
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

	// command not found
	return false;
};

Template.chat.helpers({
	freeChatPrice: function() { return Game.Chat.Messages.FREE_CHAT_PRICE; },
	isChatFree: function() { return Meteor.user().isChatFree; },
	maxMessages: function() { return Game.Chat.Messages.LIMIT; },
	isLoading: function() { return isLoading.get(); },
	gotLimit: function() { return gotLimit.get(); },
	hasMore: function() { return hasMore.get(); },
	messages: function() { return messages.list(); },

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

		// private room -> users list
		if (!room.isPublic) {
			return room.usernames;
		}

		// public room -> find from last messages
		messages.depend();
		var users = [ Meteor.user().username ];
		var time = Session.get('serverTime') - 1800;
		var n = messages.length;
		while (n-- > 0) {
			if (messages[n].timestamp < time) {
				break;
			}
			if (users.indexOf(messages[n].username) == -1) {
				users.push(messages[n].username);
			}
		}

		return users.length > 0 ? users.sort() : null;
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

	canControlRoom: function() {
		if (['admin'].indexOf(Meteor.user().role) != -1) {
			return true;
		}

		return Game.Chat.Room.Collection.findOne({
			name: Router.current().params.room,
			owner: Meteor.userId()
		});
	},

	canControlUsers: function() {
		return Game.Chat.Room.Collection.findOne({
			name: Router.current().params.room,
			owner: Meteor.userId(),
			isPublic: { $ne: true }
		});
	},

	canControlBlock: function() {
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			return true;
		}

		return Game.Chat.Room.Collection.findOne({
			name: Router.current().params.room,
			$or: [
				{ owner: Meteor.userId() },
				{ moderators: { $in: [ Meteor.user().username ] } }
			]
		});
	}
});

Template.chat.events({
	// submit message
	'submit .chat #message': function(e, t) {
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

		Meteor.call('chat.sendMessage', text, roomName, function(err, result) {
			isSending.set(false);
			if (err) {
				var errorMessage = err.error;
				if (_.isNumber(err.reason)) {
					errorMessage += ' до ' + Game.Helpers.formatDate(err.reason);
				}
				Notifications.error('Неполучилось отправить сообщение', errorMessage);
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
		if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13 || e.key == 'Enter')) {
			t.find('#message input[type="submit"]').click();
		}
	},

	'click .messages span:not(.dice), click .participants span': function(e, t) {
		t.find('#message textarea[name="text"]').value +=  '@' + e.currentTarget.innerHTML.trim();
	},

	// load previous messages
	'click .chat .more': function(e, t) {
		if (isLoading.get()) {
			return;
		}

		var roomName = Router.current().params.room;
		if (!roomName || !messages || messages.length === 0) {
			return;
		}

		isLoading.set(true);

		var options = {
			roomName: roomName,
			timestamp: messages[0].timestamp,
			isPrevious: true
		};
		
		Meteor.call('chat.loadMore', options, function(err, data) {
			isLoading.set(false);

			if (!err && data) {
				for (var i = 0; i < data.length; i++) {
					if (messages.length >= Game.Chat.Messages.LIMIT) {
						break;
					}
					addMessage(data[i]);
				}

				if (messages.length >= Game.Chat.Messages.LIMIT) {
					gotLimit.set(true);
				}

				if (messages.length >= Game.Chat.Messages.LIMIT
				 || data.length < Game.Chat.Messages.LOAD_COUNT
				) {
					hasMore.set(false);
				}
			}
		});
	},

	// other chat commands
	'click .chat .buyFreeChat': function(e, t) {
		e.preventDefault();

		if (!confirm('Вы точно хотите больше никогда не платить за ссаный чат?')) {
			return;
		}

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
	},

	'click .chat .addCredits': function(e, t) {
		var roomName = Router.current().params.room;
		var credits = prompt('Положить кредиты на счет комнаты:', '1000');
		if (credits) {
			addCredits(roomName, credits);
		}
	},

	'click li a.block': function(e, t) {
		e.preventDefault();

		var time = prompt('Укажите время блокировки в секундах', '86400');
		if (!time) {
			return;
		}

		var isLocal = true;
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			isLocal = confirm('Блокировать только эту комнату?');
		}

		blockUser({
			roomName: isLocal ? Router.current().params.room : null,
			username: e.currentTarget.dataset.username,
			time: parseInt(time, 10)
		});
	},

	'click li a.unblock': function(e, t) {
		e.preventDefault();

		var isLocal = true;
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			isLocal = confirm('Разблокировать только эту комнату?');
		}

		blockUser({
			roomName: isLocal ? Router.current().params.room : null,
			username: e.currentTarget.dataset.username,
			time: 0
		});
	},

	'click li a.remove': function(e, t) {
		e.preventDefault();

		var username = e.currentTarget.dataset.username;
		if (confirm('Удалить из комнаты пользователя ' + username + '?')) {
			removeUser(Router.current().params.room, username);
		}
	},

	'submit .chat #control': function(e, t) {
		e.preventDefault();

		var username = t.find('#control input[name="username"]').value;
		var roomName = Router.current().params.room;

		addUser(roomName, username);
		t.find('#control input[name="username"]').value = '';
	},

	'click li a.addModerator': function(e, t) {
		e.preventDefault();

		var username = prompt('Укажите логин');
		if (username) {
			addModerator(Router.current().params.room, username);
		}
	},

	'click li a.removeModerator': function(e, t) {
		e.preventDefault();

		var username = prompt('Укажите логин');
		if (username) {
			removeModerator(Router.current().params.room, username);
		}
	},

	'click li a.createRoom': function(e, t) {
		e.preventDefault();

		var name = prompt('Введите название комнаты');
		if (!name) {
			return true;
		}

		var isPublic = confirm('Комната будет публичной?');
		var isOwnerPays = confirm('Сообщения оплачиваются грязными галлактическими кредитами?');

		createRoom(name, isPublic, isOwnerPays);
	},

	'click li a.removeRoom': function(e, t) {
		e.preventDefault();

		if (confirm('Вы действительно хотите удалить текущую комнату?')) {
			removeRoom(Router.current().params.room);
		}
	}
});

};