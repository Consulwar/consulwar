Meteor.startup(function () {

Meteor.subscribe('online');

var messagesReactive = null;

Game.Chat.Collection.find({}).observeChanges({
	added: function (id, message) {
		if (messagesReactive && Router.current().params.room == message.room) {
			// add new messge
			var messages = messagesReactive.get();

			if (!messages) {
				messages = [ message ];
			} else {
				if (message.timestamp > messages[ messages.length - 1 ].timestamp) {
					messages.push( message );
				} else {
					messages.unshift( message );
				}
			}

			while (messages.length > Game.Chat.LIMIT) {
				messages.shift();
			}

			messagesReactive.set(messages);

			// scroll to bottom
			Meteor.setTimeout(scrollChatToBottom);
		}
	}
});

Game.Chat.showPage = function() {
	var roomName = this.getParams().room;

	if (!roomName) {
		Router.go('chat', { room: 'general' } );
	} else {
		messagesReactive = new ReactiveVar(null);
		Meteor.subscribe('chatRoom', this.params.room);
		Meteor.subscribe('chat', this.params.room);

		this.render('chat', {
			to: 'content',
			data: {
				messages: messagesReactive,
				hasMore: new ReactiveVar(true),
				isLoading: new ReactiveVar(false),
				gotLimit: new ReactiveVar(false)
			}
		});
	}
}

var scrollChatToBottom = function(force) {
	var container = $('ul.messages');

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 50) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
}

Template.chat.onRendered(function() {
	Meteor.setTimeout(scrollChatToBottom.bind(this, true));
});

Template.chat.helpers({
	maxMessages: function() {
		return Game.Chat.LIMIT;
	},

	gotLimit: function() {
		return this.gotLimit.get();
	},

	hasMore: function() {
		return this.hasMore.get();
	},

	messages: function() {
		return this.messages.get();
	},

	canControl: function() {
		var roomName = Router.current().params.room;
		var room = Game.ChatRoom.Collection.findOne({
			name: roomName
		});

		if (!room || room.isPublic) {
			return false;
		}

		return room.owner == Meteor.userId() ? true : false;
	},

	users: function() {
		var roomName = Router.current().params.room;
		var room = Game.ChatRoom.Collection.findOne({
			name: roomName
		});

		if (!room) {
			return null;
		}

		if (room.isPublic) {
			return Meteor.users.find({}, {sort: {'login': 1}});
		}

		var users = [];
		for (var i = 0; i < room.logins.length; i++) {
			var user = Meteor.users.findOne({ login: room.logins[i] });
			users.push({
				login: room.logins[i],
				offline: user ? false : true
			});
		}

		return users;
	},

	price: function() {
		var room = Game.ChatRoom.Collection.findOne({
			name: Router.current().params.room
		});

		if (room && !room.isPublic && room.isOwnerPays && room.owner != Meteor.userId()) {
			return 0;
		}

		return Game.Chat.getMessagePrice();
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
	'click .chat .more': function(e, t) {
		if (t.data.isLoading.get()) {
			return;
		}

		var roomName = Router.current().params.room;
		var messages = t.data.messages.get();
		if (!roomName || !messages || messages.length == 0) {
			return;
		}

		var timestamp = messages[0].timestamp;
		t.data.isLoading.set(true);
		
		Meteor.call('chat.loadMore', roomName, timestamp, function(err, data) {
			if (!err && data) {
				for (var i = 0; i < data.length; i++) {
					if (messages.length >= Game.Chat.LIMIT) {
						break;
					}
					messages.unshift( data[i] );
				}

				if (messages.length >= Game.Chat.LIMIT) {
					t.data.gotLimit.set(true);
				}

				if (messages.length >= Game.Chat.LIMIT || data.length < Game.Chat.LOAD_COUNT) {
					t.data.hasMore.set(false);
				}

				t.data.messages.set(messages);
				t.data.isLoading.set(false);
			}
		});
	},

	'submit .chat #message': function(e, t) {
		e.preventDefault();

		var roomName = Router.current().params.room;
		var text = t.find('#message textarea[name="text"]').value;

		t.find('#message').reset();

		Meteor.call('chat.sendMessage', text, roomName, function(err, result) {
			if (err) {
				Notifications.error(err);
			}
		});

		return false;
	},

	'click li a.block': function(e, t) {
		e.preventDefault();

		Meteor.call('chat.blockUser', e.currentTarget.dataset.login, 86400, null, function(err) {
			if (err) {
				Notifications.error(err);
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

});