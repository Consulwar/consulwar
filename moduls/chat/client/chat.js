initChatClient = function() {

initChatLib();

Meteor.subscribe('chatIconsUser');
Meteor.subscribe('chatIconsUnique');

var soundNotprepared = new buzz.sound('/sound/notprepared.mp3');

var currentRoomName = null;
var lostConnectionTime = null;
var chatSubscription = null;
var chatRoomSubscription = null;

var hasMore = new ReactiveVar(true);
var isLoading = new ReactiveVar(false);
var isSending = new ReactiveVar(false);
var gotLimit = new ReactiveVar(false);

var messages = new Meteor.Collection(null);
var lastMessage = null;
var firstMessage = null;

var sortMessages = function(messages) {
	//Нужно для устойчивой сортировки
	//так как сообщения приходят в обратном порядке
	//а сообщения с одинаковым timestamp в правильном порядке
	for (var i = 0; i < messages.length; i++) {
		messages[i].index = i;
	}

	return messages.sort(function(a, b) {
		var delta = a.timestamp - b.timestamp;
  		return (delta === 0 ? a.index - b.index : delta);
	});
};

var addMessage = function(message, previousMessage) {
	if (!previousMessage
	 || previousMessage.isMotd
	 || message.isMotd
	 || message.username != previousMessage.username
	 || message.role != previousMessage.role
	 || message.iconPath != previousMessage.iconPath
	) {
		message.showProfile = true;
	}
	messages.upsert(message._id, message);
};

var addMessagesAfter = function(newMessages, message) {
	addMessage(newMessages[0], message);
	for (var i = 1; i < newMessages.length; i++) {
		addMessage(newMessages[i], newMessages[i - 1]);
	}
};

var appendMessages = function(newMessages) {
	newMessages = sortMessages(newMessages);

	if (lastMessage && newMessages[0].timestamp > lastMessage.timestamp) {
		newMessages[0].hasAllowedMessages = true;
		newMessages[0].previousMessage = lastMessage;
		addMessagesAfter(newMessages, null);
	} else {
		addMessagesAfter(newMessages, lastMessage);
	}
	lastMessage = newMessages[newMessages.length - 1];

	if (!firstMessage) {
		firstMessage = newMessages[0];
	}
};

var prependMessages = function(newMessages) {
	newMessages = sortMessages(newMessages);

	firstMessage = newMessages[0];

	addMessagesAfter(newMessages, null);
};

var addMessagesBefore = function(newMessages, message) {
	newMessages = sortMessages(newMessages);

	if (newMessages[0].timestamp > message.previousMessage.timestamp) {
		newMessages.shift();
		newMessages[0].hasAllowedMessages = true;
		newMessages[0].previousMessage = message.previousMessage;
		addMessagesAfter(newMessages, null);
	} else {
		while (newMessages[0].timestamp <= message.previousMessage.timestamp) {
			newMessages.shift();
		}
		addMessagesAfter(newMessages, message.previousMessage);
	}
};


Game.Chat.Messages.Collection.find({}).observeChanges({
	added: function(id, message) {
		message._id = id;
		if (chatSubscription.ready()) {	
			addMessage(message, lastMessage);
			lastMessage = message;
			showDesctopNotofocationFromMessage(message);
			Meteor.setTimeout(scrollChatToBottom);
		}

		// limit max count
		if (messages.find().count() > Game.Chat.Messages.LIMIT) {
			messages.remove({$gte: {timestamp: firstMessage.timestamp - 60 * 10}});
			firstMessage = messages.findOne({}, {sort: {timestamp: 1}});
		}
	}
});

var showDesctopNotofocationFromMessage = function(message) {
	if (message.message && message.message.indexOf('@' + Meteor.user().username) != -1) {
		Game.showDesktopNotification(message.message, {
			who: message.username,
			icon: '/img/game/chat/icons/' + message.iconPath + '.png',
			path: Router.path('chat', {group: 'communication', room: currentRoomName})
		});
	}
};

var addMotd = function(message) {
	message.isMotd = true;
	message.timestamp = Session.get('serverTime');

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
	$('.permanent_chat').show();
	if (!currentRoomName) {
		this.render('chat', { to: 'permanent_chat' });	
	}
};

Template.chat.onRendered(function() {
	var template = this;

	$('.messages').scrollbar();

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
				hasMore.set(true);
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
				appendMessages(Game.Chat.Messages.Collection.find({}).fetch());
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
		return Notifications.error('Максимальная длинна имени 32 символов');
	}

	if (!url || url.length <= 0) {
		return Notifications.error('Укажите URL комнаты');
	}
	
	if (url.length > 32) {
		return Notifications.error('Максимальная длинна URL 32 символов');
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
				closeControlWindow();
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

	Game.showAcceptWindow(message, function() {
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
		id: '',
		name: Game.User.getLevelName(rating)
	};
};

Template.chatMessageProfile.helpers({
	getUserRoleByMessage: function(message) {
		return getUserRole(message.user_id, message.username, message.role, message.rating);
	}
});

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
		return messages.find({},{sort:{timestamp:1}});
	},

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

			var names = [ Meteor.user().username ];
			users.push({
				name: Meteor.user().username,
				role: getUserRole(Meteor.userId(), Meteor.user().username, Meteor.user().role).id
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

	'click .messages li.profile, click .participants .online': function(e, t) {
		e.stopPropagation();

		var username = e.currentTarget.dataset.username;
		if (!username || username.length <= 0) {
			return;
		}

		var chatOffset = $('.permanent_chat .chat').offset();
		var zoom = getComputedStyle(document.body).zoom;
		var userPopupWidth = 48 * 4;
		Game.Chat.showUserPopup(
			Math.min(
				e.pageX / zoom - chatOffset.left + 5, 
				$('.permanent_chat .chat').width() - userPopupWidth
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
			timestamp: parseInt(e.currentTarget.dataset.timestamp, 10) || firstMessage.timestamp,
			isPrevious: true
		};
		
		Meteor.call('chat.loadMore', options, function(err, data) {
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

				if (messages.find().count() >= Game.Chat.Messages.LIMIT
				 || (data.length < Game.Chat.Messages.LOAD_COUNT && !afterMessageId)
				) {
					hasMore.set(false);
				}
			}
		});
	},

	// other chat commands
	'click .chat .buyFreeChat': function(e, t) {
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
	}
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
	'click .arrow-left': function(e, t) {
		if (!isAnimation && canAnimateLeft(t)) {
			isAnimation = true;
			t.$('ul').animate({ left: '+=300px' }, function() {
				isAnimation = false;
				refreshArrows(t);
			});
		}
	},

	'click .arrow-right': function(e, t) {
		if (!isAnimation && canAnimateRight(t)) {
			isAnimation = true;
			t.$('ul').animate({ left: '-=300px' }, function() {
				isAnimation = false;
				refreshArrows(t);
			});
		}
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
var balanceLoading = new ReactiveVar(false);

Game.Chat.showBalanceWindow = function(roomName, credits) {
	if (!balanceWindowView) {
		balanceWindowView = Blaze.renderWithData(
			Template.chatBalance, {
				currentPage: 1,
				count: 20,
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
	'click .close': function(e, t) {
		closeBalanceWindow();
	},

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

Template.chatControl.onRendered(function() {
	calculateCreatePriceCredits(this);
});

Template.chatControl.helpers({
	canControlRoom: function() { return canControlRoom(); },
	canControlUsers: function() { return canControlUsers(); },
	canControlBlock: function() { return canControlBlock(); },
	credits: function() { return createPriceCredits.get(); },

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
	'click .close': function(e, t) {
		closeControlWindow();
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
	},

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

		if (!icon.meetRequirements()) {
			return Notifications.Error('Вы не удовлетворяете требованиям иконки');
		}

		var message = 'Купить иконку за ' + icon.price.credits + ' ГГК';

		Game.showAcceptWindow(message, function() {
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
			return Notifications.error('Вы не можете выбрать эту иконку');
		}

		if (!icon.meetRequirements()) {
			return Notifications.Error('Вы не удовлетворяете требованиям иконки');
		}

		var message = 'Сменить иконку';

		Game.showAcceptWindow(message, function() {
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