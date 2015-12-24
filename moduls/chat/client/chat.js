Meteor.startup(function () {

Game.Chat.showPage = function() {
	this.render('chat', {to: 'content'});
}

var scrollChatToBottom = function(force) {
	var container = $('ul.messages');

	if (container && container[0] && (force || (container.height() + container[0].scrollTop + 50) > container[0].scrollHeight)) {
		container[0].scrollTop = container[0].scrollHeight;
	}
}

Game.Chat.Collection.find({}, {sort: {'timestamp': 1}}).observeChanges({
	added: function (id, user) {
		Meteor.setTimeout(scrollChatToBottom);
	}
});

Template.chat.onRendered(function() {
	Meteor.setTimeout(scrollChatToBottom.bind(this, true));
})

Template.chat.helpers({
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
	'submit .chat form': function(e, t) {
		e.preventDefault();

		var text = t.find('textarea[name="text"]').value;

		t.find('form').reset();

		Meteor.call('sendMessage', text, function(err, result) {
			if (err) {
				Notifications.error(err);
			}
		});

		return false;
	},

	'click li a.block': function(e, t) {
		e.preventDefault();

		Meteor.call('blockOrUnblockChatTo', e.currentTarget.dataset.login, function(err) {
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