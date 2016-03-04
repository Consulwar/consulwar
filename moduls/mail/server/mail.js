initMailServer = function () {

initMailLib();

game.Mail.addSystemMessage = function(type, subject, text, timestamp) {
	var user = Meteor.user();
	
	Game.Mail.Collection.insert({
		owner: user._id,
		type: type,
		from: 1,
		sender: 'Система',
		to: user._id,
		recipient: user.login,
		subject: subject,
		text: text,
		status: game.Mail.status.unread,
		timestamp: timestamp || Math.floor(new Date().valueOf() / 1000)
	});
};

game.Mail.sendMessageToAll = function(type, subject, text, timestamp) {
	// TODO: Сделать рассылку очередями!
	var users = Meteor.users.find().fetch();

	for (var i = 0; i < users.length; i++) {
		Game.Mail.Collection.insert({
			owner: users[i]._id,
			type: type,
			from: 1,
			sender: 'Система',
			to: users[i]._id,
			recipient: users[i].login,
			subject: subject,
			text: text,
			status: game.Mail.status.unread,
			timestamp: timestamp || Math.floor(new Date().valueOf() / 1000)
		});
	}
	
	return users;
};

Meteor.methods({
	sendLetter: function(recipient, subject, text) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('sendLetter: ', new Date(), user.login);

		check(recipient, String);
		check(subject, String);
		check(text, String);

		subject = subject.trim();
		subject = subject || '*Без темы';

		if (subject.length > 200) {
			subject = subject.substr(0, 200);
		}

		text = text.trim();

		if (text.length > 5000) {
			text = text.substr(0, 5000);
		}

		text = sanitizeHtml(text, {
			allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		}).trim();

		if (recipient == '[all]') {

			if (['admin', 'helper'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Ээ, нет. Так не пойдет.');
			}

			// insert sender copy
			Game.Mail.Collection.insert({
				owner: user._id,
				from: user._id,
				sender: user.login,
				to: '[all]',
				recipient: '[all]',
				subject: '[Рассылка] ' + subject,
				text: text,
				status: game.Mail.status.read,
				timestamp: Math.floor(new Date().valueOf() / 1000)
			});

			// insert recipients copies
			// TODO: Сделать рассылку очередями!
			var users = Meteor.users.find().fetch();

			for (var i = 0; i < users.length; i++) {
				Game.Mail.Collection.insert({
					owner: users[i]._id,
					from: user._id,
					sender: user.login,
					to: users[i]._id,
					recipient: users[i].login,
					subject: '[Рассылка] ' + subject,
					text: text,
					status: game.Mail.status.unread,
					timestamp: Math.floor(new Date().valueOf() / 1000)
				});
			}

		} else {

			var to = Meteor.users.findOne({
				login: recipient
			}, {
				fields: {
					_id: 1,
					login: 1
				}
			});

			if (!to) {
				throw new Meteor.Error('Получателя с таким ником не существует');
			}

			var price = Game.Chat.getMessagePrice();

			var resources = Game.Resources.getValue();

			if (resources.crystals.amount < price) {
				throw new Meteor.Error('Недостаточно ресурсов');
			}

			if (price > 0) {
				Game.Resources.spend({crystals: price});
			}

			// insert sender copy
			Game.Mail.Collection.insert({
				owner: user._id,
				from: user._id,
				sender: user.login,
				to: to._id,
				recipient: to.login,
				subject: subject,
				text: text,
				status: game.Mail.status.read,
				timestamp: Math.floor(new Date().valueOf() / 1000)
			});
			
			// insert recipient copy
			Game.Mail.Collection.insert({
				owner: to._id,
				from: user._id,
				sender: user.login,
				to: to._id,
				recipient: to.login,
				subject: subject,
				text: text,
				status: game.Mail.status.unread,
				timestamp: Math.floor(new Date().valueOf() / 1000)
			});
		}
	},

	readLetter: function(id) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}
		
		check(id, String);

		Game.Mail.Collection.update({
			_id: id,
			to: Meteor.userId()
		}, {
			$set: {
				status: game.Mail.status.read
			}
		});
	},

	removeLetters: function(ids) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.Mail.Collection.update({
			_id: { $in: ids },
			owner: user._id
		}, {
			$set: {
				deleted: true
			}
		}, {
			multi: true
		});
	}
})

Meteor.publish('mail', function () {
	if (this.userId) {
		return Game.Mail.Collection.find({
			owner: this.userId,
			deleted: { $ne: true }
		}, {
			sort: {
				timestamp: -1
			},
			limit: 200
		});
	} else {
		this.ready();
	}
});

initMailQuizServer();

}