initMailServer = function () {

initMailLib();

game.Mail.addSystemMessage = function(type, subject, text, timestamp) {
	var user = Meteor.user();
	
	Game.Mail.Collection.insert({
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
	var users = Meteor.users.find().fetch();

	for (var i = 0; i < users.length; i++) {
		Game.Mail.Collection.insert({
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

		if (text.length > 5000) {
			text = text.substr(0, 5000);
		}

		text = sanitizeHtml(text.trim(), {
			allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		}).trim();

		if (recipient == '[all]') {
			if (['admin', 'helper'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Ээ, нет. Так не пойдет.');
			}

			var users = Meteor.users.find().fetch();

			for (var i = 0; i < users.length; i++) {
				Game.Mail.Collection.insert({
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
			var to = Meteor.users.findOne({login: recipient}, {fields: {_id: 1, login: 1}});

			//console.log(recipient);
			//console.log(to);

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

			/*var set = {
				'game.resources.crystals.amount': user.game.resources.crystals.amount - 10
			}

			console.log(set);

			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			});*/

			Game.Mail.Collection.insert({
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

		Game.Mail.Collection.update({'_id': id, to: Meteor.userId()}, {
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

		Game.Mail.Collection.remove({
			$or: [
				{from: this.userId},
				{to: this.userId}
			],
			_id: {
				$in: ids
			}
		})
	}
})

Meteor.publish('mail', function () {
	if (this.userId) {
		return Game.Mail.Collection.find({$or: [
				{from: this.userId},
				{to: this.userId}
			]}, {
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