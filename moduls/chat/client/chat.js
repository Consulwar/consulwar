initChatClient = function() {

initChatLib();

Session.set('chatRoom', 'general');

var messages = new ReactiveArray();
var hasMore = new ReactiveVar(true);
var isLoading = new ReactiveVar(false);
var isSending = new ReactiveVar(false);
var gotLimit = new ReactiveVar(false);

Game.Chat.Messages.Collection.find({}).observeChanges({
	added: function(id, message) {
		// add new messge
		if (messages.length == 0
		 || messages[ messages.length - 1 ].timestamp <= message.timestamp
		) {
			messages.push( message );
		} else {
			messages.unshift( message );
		}

		// limit max count
		while (messages.length > Game.Chat.Messages.LIMIT) {
			messages.shift();
		}

		// scroll to bottom
		Meteor.setTimeout(scrollChatToBottom);
	}
});

Game.Chat.Room.Collection.find({}).observeChanges({
	added: function(id, room) {
		Session.set('chatRoom', room.name);
		if (room.motd) {
			room.motd.timestamp = Session.get('serverTime');
			messages.push(room.motd);
			Meteor.setTimeout(scrollChatToBottom);
		}
	},

	changed: function(id, fields) {
		if (fields.motd) {
			fields.motd.timestamp = Session.get('serverTime');
			messages.push(fields.motd);
			Meteor.setTimeout(scrollChatToBottom);
		}
	}
})

Game.Chat.showPage = function() {
	this.render('chat', { to: 'content' });
}

var scrollChatToBottom = function(force) {
	var container = $('ul.messages');

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 50) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
}

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
}

var removeRoom = function(name) {
	Meteor.call('chat.removeRoom', name, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Вы успешно удалили комнату ' + name);
			Router.go('chat', { room: 'general' });
		}
	});
}

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
}

var addUser = function(roomName, login) {
	Meteor.call('chat.addUserToRoom', roomName, login, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Пользователь добавлен в комнату');
		}
	});
}

var removeUser = function(roomName, login) {
	Meteor.call('chat.removeUserFromRoom', roomName, login, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Пользователь удален из комнаты');
		}
	});
}

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
}

var addModerator = function(roomName, login) {
	Meteor.call('chat.addModeratorToRoom', roomName, login, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Модератор назначен');
		}
	});
}

var removeModerator = function(roomName, login) {
	Meteor.call('chat.removeModeratorFromRoom', roomName, login, function(err, data) {
		if (err) {
			Notifications.error(err.error);
		} else {
			Notifications.success('Модератор разжалован');
		}
	});
}

var execClientCommand = function(message) {
	// create new channel
	if (message.indexOf('/create channel') == 0) {
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
	else if (message.indexOf('/remove channel') == 0) {
		if (confirm('Вы действительно хотите удалить текущую комнату?')) {
			removeRoom(Router.current().params.room);
		}
		return true;
	}
	// join existing channel
	else if (message.indexOf('/join') == 0) {
		Router.go('chat', { room: message.substr('/join'.length).trim() });
		return true;
	}
	// add funds to channel
	else if (message.indexOf('/add credits') == 0) {
		addCredits(Router.current().params.room, message.substr('/add credits'.length).trim())
		return true;
	}
	// add user to channel
	else if (message.indexOf('/add user') == 0) {
		addUser(Router.current().params.room, message.substr('/add user'.length).trim());
		return true;
	}
	// remove user from channel
	else if (message.indexOf('/remove user') == 0) {
		removeUser(Router.current().params.room, message.substr('/remove user'.length).trim());
		return true;
	}
	// block user
	else if (message.indexOf('/block') == 0) {
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
			login: message.substr('/block'.length).trim(),
			time: parseInt(time, 10)
		});
		return true;
	}
	// unblock user
	else if (message.indexOf('/unblock') == 0) {
		var isLocal = true;
		if (['admin', 'helper'].indexOf(Meteor.user().role) != -1) {
			isLocal = confirm('Разблокировать только эту комнату?');
		}

		blockUser({
			roomName: isLocal ? Router.current().params.room : null,
			login: message.substr('/unblock'.length).trim(),
			time: 0
		});
		return true;
	}
	// add moderator
	else if (message.indexOf('/add moderator') == 0) {
		addModerator(Router.current().params.room, message.substr('/add moderator'.length).trim());
		return true;
	}
	// remove moderator
	else if (message.indexOf('/remove moderator') == 0) {
		removeModerator(Router.current().params.room, message.substr('/remove moderator'.length).trim());
		return true;
	}

	// command not found
	return false;
}

Template.chat.onRendered(function() {
	Meteor.setTimeout(scrollChatToBottom.bind(this, true));

	// run this function each time as room changes
	this.autorun(function() {
		var roomName = Router.current().getParams().room;

		if (roomName) {
			messages.clear();
			hasMore.set(true);
			isLoading.set(false);
			isSending.set(false);
			gotLimit.set(false);
			
			Meteor.subscribe('chatRoom', roomName);
			Meteor.subscribe('chat', roomName);
		}
	});
});

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
			return room.logins;
		}

		// public room -> find from last messages
		messages.depend();
		var users = [ Meteor.user().login ];
		var time = Session.get('serverTime') - 1800;
		var n = messages.length;
		while (n-- > 0) {
			if (messages[n].timestamp < time) {
				break;
			}
			if (users.indexOf(messages[n].login) == -1) {
				users.push(messages[n].login);
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
		if (text.indexOf('/me') == 0) {
			text = text.substr(3);
		}

		return text.replace('@' + Meteor.user().login, '<span class="me">@' + Meteor.user().login + '</span>');
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
				{ moderators: { $in: [ Meteor.user().login ] } }
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
				if (err.reason) {
					errorMessage += ' до ' + Game.Helpers.formatDate(err.reason);
				}
				Notifications.error(errorMessage);
			} else {
				t.find('#message').reset();
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
		if (!roomName || !messages || messages.length == 0) {
			return;
		}

		var timestamp = messages[0].timestamp;
		isLoading.set(true);
		
		Meteor.call('chat.loadMore', roomName, timestamp, function(err, data) {
			if (!err && data) {
				for (var i = 0; i < data.length; i++) {
					if (messages.length >= Game.Chat.Messages.LIMIT) {
						break;
					}
					messages.unshift( data[i] );
				}

				if (messages.length >= Game.Chat.Messages.LIMIT) {
					gotLimit.set(true);
				}

				if (messages.length >= Game.Chat.Messages.LIMIT
				 || data.length < Game.Chat.Messages.LOAD_COUNT
				) {
					hasMore.set(false);
				}

				isLoading.set(false);
			}
		});
	},

	// other chat commands
	'click .chat .buyFreeChat': function(e, t) {
		e.preventDefault();

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
			login: e.currentTarget.dataset.login,
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
			login: e.currentTarget.dataset.login,
			time: 0
		});
	},

	'click li a.remove': function(e, t) {
		e.preventDefault();

		var login = e.currentTarget.dataset.login;
		if (confirm('Удалить из комнаты пользователя ' + login + '?')) {
			removeUser(Router.current().params.room, login);
		}
	},

	'submit .chat #control': function(e, t) {
		e.preventDefault();

		var login = t.find('#control input[name="login"]').value;
		var roomName = Router.current().params.room;

		addUser(roomName, login);
		t.find('#control input[name="login"]').value = '';
	},

	'click li a.addModerator': function(e, t) {
		e.preventDefault();

		var login = prompt('Укажите логин');
		if (login) {
			addModerator(Router.current().params.room, login);
		}
	},

	'click li a.removeModerator': function(e, t) {
		e.preventDefault();

		var login = prompt('Укажите логин');
		if (login) {
			removeModerator(Router.current().params.room, login);	
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

}