Meteor.startup(function () {

Meteor.subscribe('online');

Game.Chat.showPage = function() {
	var roomId = this.getParams().room;

	if (!roomId) {
		Router.go('chat', { room: 'general' } );
	} else {
		Meteor.subscribe('chat', this.params.room, Game.Chat.MESSAGE_AMOUNT);
		this.render('chat', {
			to: 'content',
			data: {
				maxMessages: new ReactiveVar( Game.Chat.MESSAGE_AMOUNT )
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

	users: function() {
		return Meteor.users.find({}, {sort: {'login': 1}});
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
	'click a.more': function(e, t) {
		var count = t.data.maxMessages.get();
		t.data.maxMessages.set( count + Game.Chat.MESSAGE_AMOUNT );
		Meteor.subscribe('chat', Router.current().params.room, t.data.maxMessages.get());
	},

	'submit .chat form': function(e, t) {
		e.preventDefault();

		var roomId = Router.current().params.room;
		var text = t.find('textarea[name="text"]').value;

		t.find('form').reset();

		Meteor.call('chat.sendMessage', text, roomId, function(err, result) {
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
			t.find('input[type="submit"]').click();
		}
	},

	'click .messages span:not(.dice), click .participants li': function(e, t) {
		t.find('textarea[name="text"]').value = t.find('textarea[name="text"]').value + '@' + e.currentTarget.innerHTML;
	}
});

});