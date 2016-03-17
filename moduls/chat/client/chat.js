initChatClient = function() {

initChatLib();

var messages = new ReactiveArray();
var hasMore = new ReactiveVar(true);
var isLoading = new ReactiveVar(false);
var isSending = new ReactiveVar(false);
var gotLimit = new ReactiveVar(false);

Game.Chat.Messages.Collection.find({}).observeChanges({
	added: function (id, message) {
		if (Router.current().params.room == message.room) {
			// add new messge
			if (messages.length == 0
			 || messages[ messages.length - 1 ].timestamp < message.timestamp
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
	}
});

Game.Chat.showPage = function() {
	this.render('chat', { to: 'content' });
}

var scrollChatToBottom = function(force) {
	var container = $('ul.messages');

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 50) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
}

// TODO: Отрефакторить! Вынести в отдельные функции, чтобы использовать их из GUI.
var execClientCommand = function(message) {
	// create new channel
	if (message.indexOf('/create channel') == 0) {

		var name = prompt('Введите название канала');
		if (!name) {
			return true; 
		}

		var isPublic = confirm('Комната будет публичной?');
		var isOwnerPays = confirm('Вы будете оплачивать сообщения в комнате?');

		Meteor.call('chat.createRoom', name, isPublic, isOwnerPays, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Вы успешно создали комнату');
				Router.go('chat', { room: name });
			}
		});
		return true;
	}
	// remove current channel
	else if (message.indexOf('/remove channel') == 0) {
		var roomName = Router.current().params.room;
		var isOk = confirm('Вы действительно хотите удалить текущую комнату?');

		if (isOk) {
			Meteor.call('chat.removeRoom', roomName, function(err, data) {
				if (err) {
					Notifications.error(err.error);
				} else {
					Notifications.success('Вы успешно удалили комнату');
					Router.go('chat', { room: 'general' });
				}
			});
		}
		return true;
	}
	// join existing channel
	else if (message.indexOf('/join') == 0) {
		var roomName = message.substr('/join'.length).trim();
		Router.go('chat', { room: roomName });
		return true;
	}
	// add user to channel
	else if (message.indexOf('/add user') == 0) {
		var login = message.substr('/add user'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.addUserToRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// remove user from channel
	else if (message.indexOf('/remove user') == 0) {
		var login = message.substr('/remove user'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.removeUserFromRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// add user to channel
	else if (message.indexOf('/add user') == 0) {
		var login = message.substr('/add user'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.addUserToRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// remove user from channel
	else if (message.indexOf('/remove user') == 0) {
		var login = message.substr('/remove user'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.removeUserFromRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// block user
	else if (message.indexOf('/block') == 0) {
		var time = prompt('Укажите время блокировки в секундах', '86400');
		if (!time) {
			return;
		}

		var options = {
			roomName: Router.current().params.room,
			login: message.substr('/block'.length).trim(),
			time: parseInt(time, 10)
		}

		Meteor.call('chat.blockUser', options, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// unblock user
	else if (message.indexOf('/unblock') == 0) {
		var options = {
			roomName: Router.current().params.room,
			login: message.substr('/unblock'.length).trim(),
			time: 0
		}

		Meteor.call('chat.blockUser', options, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// add moderator
	else if (message.indexOf('/add moderator') == 0) {
		var login = message.substr('/add moderator'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.addModeratorToRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
		return true;
	}
	// remove moderator
	else if (message.indexOf('/remove moderator') == 0) {
		var login = message.substr('/remove moderator'.length).trim();
		var roomName = Router.current().params.room;

		Meteor.call('chat.removeModeratorFromRoom', roomName, login, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			}
		});
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

	canControl: function() {
		return Game.Chat.Room.Collection.findOne({
			name: Router.current().params.room,
			owner: Meteor.userId()
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
	}
});

Template.chat.events({
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

		if (!credits) {
			return;
		}

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
	},

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
					errorMessage += ' до ' + Game.formatDate(err.reason);
				}
				Notifications.error(errorMessage);
			} else {
				t.find('#message').reset();
			}
		});

		return false;
	},

	'click li a.block': function(e, t) {
		e.preventDefault();

		var time = prompt('Укажите время блокировки в секундах', '86400');
		if (!time) {
			return;
		}

		var options = {
			login: e.currentTarget.dataset.login,
			time: parseInt(time, 10)
		}

		Meteor.call('chat.blockUser', options, function(err) {
			if (err) {
				Notifications.error(err.error);
			}
		});
	},

	'keypress textarea[name="text"]': function(e, t) {
		if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13 || e.key == 'Enter')) {
			t.find('#message input[type="submit"]').click();
		}
	},

	'click .messages span:not(.dice), click .participants li': function(e, t) {
		t.find('#message textarea[name="text"]').value = t.find('#message textarea[name="text"]').value + '@' + e.currentTarget.innerHTML;
	},

	'submit .chat #control': function(e, t) {
		e.preventDefault();

		var login = t.find('#control input[name="login"]').value;
		var roomName = Router.current().params.room;

		if (login && roomName) {
			Meteor.call('chat.addUserToRoom', roomName, login, function(err, data) {
				if (!err) {
					t.find('#control').reset();
				} else {
					Notifications.error(err.error);
				}
			});
		}
	}
});

}