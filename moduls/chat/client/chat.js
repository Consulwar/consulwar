initChatClient = function() {

initChatLib();

Meteor.subscribe('chatIcons');

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
	var template = this;

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

		if (roomName) {
			if (roomName != currentRoomName // new room
			 || messages.length === 0       // or don't have any messages
			 || noConnectionPeriod >= 1800  // or lost connection more than 30 min
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
				Meteor.setTimeout(scrollChatToBottom.bind(template, true));
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
					Meteor.setTimeout(scrollChatToBottom.bind(template, true));
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

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 100) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
};

var createRoom = function(name, isPublic, isOwnerPays) {
	if (!name || name.length <= 0) {
		Notifications.error('Укажите имя комнаты');
		return;
	}
	
	if (name.length > 15) {
		Notifications.error('Максимальная длинна имени 15 символов');
		return;
	}

	var message = 'Создать ' + (isPublic ? 'публичную' : 'приватную') + ' комнату с именем ' + name;

	var price = Game.Chat.Room.getPrice({
		isPublic: isPublic,
		isOwnerPays: isOwnerPays
	});

	if (price && price.credits) {
		message += ' за ' + price.credits + ' ГГК';
	}

	Game.Chat.showAcceptWindow(message, function() {
		Meteor.call('chat.createRoom', name, isPublic, isOwnerPays, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Вы успешно создали комнату ' + name);
				closeControlWindow();
				Router.go('chat', { room: name });
			}
		});
	});
};

var removeRoom = function(name) {
	if (!name || name.length <= 0) {
		Notifications.error('Укажите имя комнаты');
		return;
	}

	Game.Chat.showAcceptWindow('Удалить комнату ' + name, function() {
		Meteor.call('chat.removeRoom', name, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Вы успешно удалили комнату ' + name);
				closeControlWindow();
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
		Notifications.error('Минимальная сумма 100 ГГК');
		return;
	}

	var message = 'Зачислить ' + credits + ' ГГК на счет конматы ' + roomName;

	Game.Chat.showAcceptWindow(message, function() {
		Meteor.call('chat.addCreditsToRoom', roomName, credits, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Кредиты успешно зачисленны на счет комнаты');
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

	Game.Chat.showAcceptWindow(message, function() {
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

var execClientCommand = function(message) {
	// show help
	if (message.indexOf('/help') === 0) {
		Game.Chat.showHelpWindow();
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
	if (role == 'admin') {
		return {
			id: role,
			name: 'Администратор'
		};
	} else if (role == 'helper') {
		return {
			id: role,
			name: 'Помошник'
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
		name: 'Ранг ' + Game.User.getLevel(rating)
	};
};

Template.chat.helpers({
	freeChatPrice: function() { return Game.Chat.Messages.FREE_CHAT_PRICE; },
	isChatFree: function() { return Meteor.user().isChatFree; },
	maxMessages: function() { return Game.Chat.Messages.LIMIT; },
	isLoading: function() { return isLoading.get(); },
	gotLimit: function() { return gotLimit.get(); },
	hasMore: function() { return hasMore.get(); },
	messages: function() { return messages.list(); },

	getUserRole: function() {
		var user = Meteor.user();
		return getUserRole(user._id, user.username, user.role, user.rating);
	},

	getUserRoleByMessage: function(message) {
		return getUserRole(message.user_id, message.username, message.role, message.rating);
	},

	room: function() {
		return Game.Chat.Room.Collection.findOne({
			name: Router.current().params.room
		});
	},

	iconPath: function() {
		var user = Meteor.user();
		if (user.settings && user.settings.chat && user.settings.chat.icon) {
			return user.settings.chat.icon;
		}
		return 'common/1';
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
	}
});

Template.chat.events({
	'click .chat': function(e, t) {
		hidePopups();
	},

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

	'click .participants span': function(e, t) {
		t.find('#message textarea[name="text"]').value +=  '@' + e.currentTarget.innerHTML.trim();
	},

	'click .messages li': function(e, t) {
		e.stopPropagation();

		var username = e.currentTarget.dataset.username;
		if (!username || username.length <= 0) {
			return;
		}

		var parentPosition = t.$('.messages').position();
		var position = $(e.currentTarget).position();

		Game.Chat.showUserPopup(
			position.left + parentPosition.left + 200,
			position.top + parentPosition.top,
			username
		);
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

			if (err) {
				Notifications.error('Не удалось загрузить сообщения', err.error);
				return;
			}

			if (data) {
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

		Game.Chat.showAcceptWindow('Вы точно хотите больше никогда не платить за ссаный чат?', function() {
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

	'click .chat .addCredits': function(e, t) {
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
	hideRoomsPopup();
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
			}, $('.chat')[0]
		);
	}
};

var hideUserPopup = function() {
	if (userPopupView) {
		Blaze.remove(userPopupView);
		userPopupView = null;
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
	}
});

Template.chatUserPopup.events({
	'click .response': function(e, t) {
		$('.chat #message textarea[name="text"]').get(0).value +=  '@' + t.data.username;
	},

	'click .add': function(e, t) {
		e.stopPropagation();
		t.$('.rooms').show();
	},

	'click .rooms li': function(e, t) {
		addUser(e.currentTarget.dataset.roomname, t.data.username);
	},

	'click .block': function(e, t) {
		Game.Chat.showControlWindow(t.data.username);
	}
});

// ----------------------------------------------------------------------------
// Rooms list + popup
// ----------------------------------------------------------------------------

var roomsList = new ReactiveVar(null);

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

Template.chatRoomsList.onRendered(function() {
	if (!roomsList.get()) {
		Meteor.call('chat.getRoomsList', function(err, data) {
			if (!err) {
				roomsList.set(data);
			}
		});
	}
});

Template.chatRoomsList.helpers({
	rooms: function() { return roomsList.get(); },
	isVisible: function(roomName) { return checkIsRoomVisible(roomName); }
});

Template.chatRoomsList.events({
	'click .arrow-left': function(e, t) {
		t.$('ul').animate({ left: '+=150px' });
	},

	'click .arrow-right': function(e, t) {
		t.$('ul').animate({ left: '-=150px' });
	},

	'click .arrow-down': function(e, t) {
		e.stopPropagation();
		Game.Chat.showRoomsPopup();
	},

	'click .hide': function(e, t) {
		rooms = {};
		rooms[e.currentTarget.dataset.roomname] = false;
		Meteor.call('chat.setupRoomsVisibility', rooms, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
	}
});

var roomsPopupView = null;

Game.Chat.showRoomsPopup = function() {
	if (!roomsPopupView) {
		hidePopups();
		roomsPopupView = Blaze.render(Template.chatRoomsPopup, $('.chat')[0]);
	}
};

var hideRoomsPopup = function() {
	if (roomsPopupView) {
		Blaze.remove(roomsPopupView);
		roomsPopupView = null;
	}
};

Template.chatRoomsPopup.helpers({
	rooms: function() { return roomsList.get(); },
	isVisible: function(roomName) { return checkIsRoomVisible(roomName); }
});

Template.chatRoomsPopup.events({
	'click li': function(e, t) {
		e.stopPropagation();
	},

	'click .save': function(e, t) {
		var rooms = {};

		t.$('li').each(function(index, element) {
			rooms[element.dataset.roomname] = $(element).find(':checked').length > 0;
		});

		if (_.keys(rooms).length > 0) {
			Meteor.call('chat.setupRoomsVisibility', rooms, function(err, data) {
				if (err) {
					Notifications.error(err.error);
				}
			});
		}
	}
});

// ----------------------------------------------------------------------------
// Accept window
// ----------------------------------------------------------------------------

var acceptWindowView = null;

Game.Chat.showAcceptWindow = function(message, onAccept, onCancel) {
	if (!acceptWindowView) {
		acceptWindowView = Blaze.renderWithData(
			Template.chatAccept, {
				message: message,
				onAccept: onAccept,
				onCancel: onCancel
			}, $('.over')[0]
		);
	}
};

var closeAcceptWindow = function(callback) {
	if (acceptWindowView) {
		Blaze.remove(acceptWindowView);
		acceptWindowView = null;
	}
	if (_.isFunction(callback)) {
		callback.call();
	}
};

Template.chatAccept.events({
	'click .close': function(e, t) {
		closeAcceptWindow(t.data.onCancel);
	},

	'click .cancel': function(e, t) {
		closeAcceptWindow(t.data.onCancel);
	},

	'click .accept': function(e, t) {
		closeAcceptWindow(t.data.onAccept);
	}
});

// ----------------------------------------------------------------------------
// Help and rules window
// ----------------------------------------------------------------------------

var helpWindowView = null;

Game.Chat.showHelpWindow = function() {
	if (!helpWindowView) {
		helpWindowView = Blaze.render(Template.chatHelp, $('.over')[0]);
	}
};

Template.chatHelp.onRendered(function() {
	this.$('.tabRules').removeClass('active');
	this.$('.rules').hide();
	this.$('.tabCommands').addClass('active');
	this.$('.commands').show();
});

Template.chatHelp.events({
	'click .close': function(e, t) {
		if (helpWindowView) {
			Blaze.remove(helpWindowView);
			helpWindowView = null;
		}
	},

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

var balanceWindowView = null;
var balanceHistory = new ReactiveVar(null);
var balanceHistoryCount = new ReactiveVar(null);

Game.Chat.showBalanceWindow = function(roomName, credits) {
	if (!balanceWindowView) {
		balanceWindowView = Blaze.renderWithData(
			Template.chatBalance, {
				roomName: roomName,
				credits: credits
			}, $('.over')[0]
		);
	}
};

var closeBalanceWindow = function() {
	if (balanceWindowView) {
		Blaze.remove(balanceWindowView);
		balanceWindowView = null;
	}
};

var loadBalanceHistory = function(roomName, page) {
	balanceHistory.set(null);
	balanceHistoryCount.set(null);

	Meteor.call('chat.getBalanceHistory', roomName, page, 20, function(err, result) {
		if (err) {
			Notifications.error('Не удалось загрузить историю пополнения', err.error);
		} else {
			balanceHistory.set(result.data);
			balanceHistoryCount.set(result.count);
		}
	});
};

Template.chatBalance.onRendered(function() {
	loadBalanceHistory(this.data.roomName, 1);
});

Template.chatBalance.helpers({
	countTotal: function() { return balanceHistoryCount.get(); },
	history: function() { return balanceHistory.get(); }
});

Template.chatBalance.events({
	'click .close': function(e, t) {
		closeBalanceWindow();
	},

	'click .accept': function(e, t) {
		addCredits(t.data.roomName, t.find('input[name="credits"]').value );
	}
});

// ----------------------------------------------------------------------------
// Settings and create window
// ----------------------------------------------------------------------------

var controlWindowView = null;
var createPriceCredits = new ReactiveVar(null);

Game.Chat.showControlWindow = function(username) {
	if (!controlWindowView) {
		controlWindowView = Blaze.renderWithData(
			Template.chatControl, {
				username: username
			}, $('.over')[0]
		);
	}
};

var closeControlWindow = function() {
	if (controlWindowView) {
		Blaze.remove(controlWindowView);
		controlWindowView = null;
	}
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

Template.chatControl.onRendered(function() {
	calculateCreatePriceCredits(this);
});

Template.chatControl.helpers({
	canControlRoom: function() { return canControlRoom(); },
	canControlUsers: function() { return canControlUsers(); },
	canControlBlock: function() { return canControlBlock(); },
	credits: function() { return createPriceCredits.get(); }
});

Template.chatControl.events({
	'click .close': function(e, t) {
		closeControlWindow();
	},

	'click input[name="roomType"], click input[name="roomPayment"]': function(e, t) {
		calculateCreatePriceCredits(t);
	},

	'click .create': function(e, t) {
		createRoom(
			t.find('input[name="roomname"]').value,
			t.find('input[name="roomType"]:checked').value == 'public',
			t.find('input[name="roomPayment"]:checked').value == 'credits'
		);
	},

	'click .removeRoom': function(e, t) {
		removeRoom(Router.current().params.room);
	},

	'click .block': function(e, t) {
		blockUser({
			roomName: t.find('input[name="blockType"]:checked').value == 'local'
				? Router.current().params.room
				: null,
			username: t.find('input[name="username"]').value,
			time: parseInt( t.find('input[name="period"]').value * 60 ),
			reason: t.find('textarea[name="reason"]').value
		});
	},

	'click .unblock': function(e, t) {
		blockUser({
			roomName: t.find('input[name="blockType"]:checked').value == 'local'
				? Router.current().params.room
				: null,
			username: t.find('input[name="username"]').value,
			time: 0,
			reason: t.find('textarea[name="reason"]').value
		});
	},

	'click .removeUser': function(e, t) {
		removeUser(Router.current().params.room, t.find('input[name="username"]').value);
	},

	'click .addModerator': function(e, t) {
		addModerator(Router.current().params.room, t.find('input[name="moderatorname"]').value);
	},

	'click .removeModerator': function(e, t) {
		removeModerator(Router.current().params.room, t.find('input[name="moderatorname"]').value);
	}
});

// ----------------------------------------------------------------------------
// Icons window
// ----------------------------------------------------------------------------

var iconsWindowView = null;
var iconsWindowTab = new ReactiveVar(null);

Game.Chat.showIconsWindow = function() {
	if (!iconsWindowView) {
		iconsWindowView = Blaze.renderWithData(Template.chatIcons, { }, $('.over')[0]);
	}
};

Template.chatIcons.onRendered(function() {
	iconsWindowTab.set('items');
	this.$('.tabItems').addClass('active');
	this.$('.tabShop').removeClass('active');
});

Template.chatIcons.helpers({
	currentTab: function() { return iconsWindowTab.get(); },

	iconGroups: function() {
		var currentTab = iconsWindowTab.get();
		var result = [];

		for (var key in Game.Chat.Icons.items) {
			if (currentTab == 'shop' && Game.Chat.Icons.items[key].isDefault) {
				continue;
			}

			var group = {
				engName: Game.Chat.Icons.items[key].engName,
				name: Game.Chat.Icons.items[key].name
			};

			var icons = [];
			for (var iconKey in Game.Chat.Icons.items[key].icons) {
				var icon = Game.Chat.Icons.items[key].icons[iconKey];
				if (currentTab == 'shop' || icon.checkHas()) {
					icons.push(icon);
				}
			}

			if (icons.length > 0) {
				group.items = icons;
			}

			result.push(group);
		}

		return result;
	}
});

Template.chatIcons.events({
	'click .close': function(e, t) {
		if (iconsWindowView) {
			Blaze.remove(iconsWindowView);
			iconsWindowView = null;
		}
	},

	'click .tabItems': function(e, t) {
		iconsWindowTab.set('items');
		t.$('.tabItems').addClass('active');
		t.$('.tabShop').removeClass('active');
	},

	'click .tabShop': function(e, t) {
		iconsWindowTab.set('shop');
		t.$('.tabItems').removeClass('active');
		t.$('.tabShop').addClass('active');
	},

	'click .buy': function(e, t) {
		var group = e.currentTarget.dataset.group;
		var id = e.currentTarget.dataset.id;

		var icon = Game.Chat.Icons.getIcon(group, id);
		if (!icon || !icon.canBuy()) {
			Notifications.error('Вы не можете купить эту иконку');
			return;
		}

		var message = 'Купить иконку за ' + icon.price.credits + ' ГГК';

		Game.Chat.showAcceptWindow(message, function() {
			Meteor.call('chat.buyIcon', group, id, function(err, result) {
				if (err) {
					Notifications.error('Не удалось купить иконку', err.error);
				} else {
					Notifications.success('Вы купили иконку');
				}
			});
		});
	},

	'click .select': function(e, t) {
		var group = e.currentTarget.dataset.group;
		var id = e.currentTarget.dataset.id;

		var icon = Game.Chat.Icons.getIcon(group, id);
		if (!icon || !icon.checkHas()) {
			Notifications.error('Вы не можете выбрать эту иконку');
			return;
		}

		var message = 'Сменить иконку';

		Game.Chat.showAcceptWindow(message, function() {
			Meteor.call('chat.selectIcon', group, id, function(err, result) {
				if (err) {
					Notifications.error('Не удалось выбрать иконку', err.error);
				} else {
					Notifications.success('Вы поменяли иконку');
				}
			});
		});
	}
});

};