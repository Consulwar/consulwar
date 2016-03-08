Meteor.startup(function () {

Meteor.subscribe('online');

Game.Chat.showPage = function() {
	var roomName = this.getParams().room;

	if (!roomName) {
		Router.go('chat', { room: 'general' } );
	} else {
		var roomInfo = new ReactiveVar(null);
		Meteor.call('chat.getRoomInfo', roomName, function(err, data) {
			if (!err) {
				roomInfo.set(data);
			}
		});

		Meteor.subscribe('chat', this.params.room, Game.Chat.MESSAGE_AMOUNT);

		this.render('chat', {
			to: 'content',
			data: {
				maxMessages: new ReactiveVar( Game.Chat.MESSAGE_AMOUNT ),
				room: roomInfo
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

Game.Chat.Collection.find({}, {sort: {'timestamp': 1}}).observeChanges({
	added: function (id, message) {
		var currentRoom = Router.current().params.room;
		if (currentRoom == message.room) {
			Meteor.setTimeout(scrollChatToBottom);
		}
	}
});

Template.chat.onRendered(function() {
	Meteor.setTimeout(scrollChatToBottom.bind(this, true));
});

Template.chat.helpers({
	hasMore: function() {
		if (Game.Chat.MESSAGE_LIMIT <= this.maxMessages.get()) {
			return false;
		}
		var count = Game.Chat.Collection.find({}).count();
		return count < this.maxMessages.get() ? false : true;
	},

	messages: function() {
		return Game.Chat.Collection.find({}, {sort: {'timestamp': 1}});
	},

	room: function() {
		return this.room.get();
	},

	canControl: function() {
		var room = this.room.get();
		if (!room || room.isPublic) {
			return false;
		}
		return room.owner == Meteor.userId() ? true : false;
	},

	users: function() {
		var room = this.room.get();
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
		var count = t.data.maxMessages.get();
		t.data.maxMessages.set( count + Game.Chat.MESSAGE_AMOUNT );
		Meteor.subscribe('chat', Router.current().params.room, t.data.maxMessages.get());
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

		Meteor.call('chat.blockOrUnblockUser', e.currentTarget.dataset.login, function(err) {
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