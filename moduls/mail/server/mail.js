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

	Meteor.users.update({ _id: user._id }, { $inc: { totalMail: 1 } });
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

		Meteor.users.update({ _id: users[i]._id }, { $inc: { totalMail: 1 } });
	}
	
	return users;
};

Meteor.methods({
	'mail.sendLetter': function(recipient, subject, text) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var currentTime = Math.floor(new Date().valueOf() / 1000);

		if (user.mailBlockedUntil && user.mailBlockedUntil > currentTime) {
			throw new Meteor.Error('Почта заблокирована');
		}

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

		if (text.length == 0) {
			throw new Meteor.Error('Напиши хоть что-нибудь!');
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

			Meteor.users.update({ _id: user._id }, { $inc: { totalMail: 1 } });

			// insert recipients copies
			// TODO: Сделать рассылку очередями!
			var users = Meteor.users.find().fetch();

			for (var i = 0; i < users.length; i++) {
				if (users[i]._id == user._id) {
					continue;
				}

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

				Meteor.users.update({ _id: users[i]._id }, { $inc: { totalMail: 1 } });
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

			Meteor.users.update({ _id: user._id }, { $inc: { totalMail: 1 } });
			
			if (user._id != to._id) {
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

				Meteor.users.update({ _id: to._id }, { $inc: { totalMail: 1 } });
			}
		}
	},

	'mail.readLetter': function(id) {
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
			owner: user._id
		}, {
			$set: {
				status: game.Mail.status.read
			}
		});
	},

	'mail.checkLogin': function(login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		return target ? true : false;
	},

	'mail.complainLetter': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		check(id, String);

		var updateCount = Game.Mail.Collection.update({
			_id: id,
			owner: user._id,
			complaint: { $ne: true }
		}, {
			$set: {
				complaint: true
			}
		});

		if (updateCount > 0) {
			Game.Statistic.Collection.upsert({}, {
				$inc: { totalMailComplaints: updateCount }
			});
		}
	},

	'mail.removeLetters': function(ids) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		var updateCount = Game.Mail.Collection.update({
			_id: { $in: ids },
			owner: user._id
		}, {
			$set: {
				deleted: true
			}
		}, {
			multi: true
		});

		if (updateCount > 0) {
			updateCount = updateCount * -1;
			Meteor.users.update({ _id: user._id }, { $inc: { totalMail: updateCount } });
		}
	},

	'mail.blockUser': function(login, time) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Ээ, нет. Так не пойдет.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		check(time, Match.Integer);

		var timestamp = Game.getCurrentTime() + time;

		Meteor.users.update({
			_id: target._id
		}, {
			$set: {
				mailBlockedUntil: timestamp
			}
		});
	},

	'mail.unblockUser': function(login) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Ээ, нет. Так не пойдет.');
		}

		var target = Meteor.users.findOne({
			login: login
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}

		var timestamp = Game.getCurrentTime();

		Meteor.users.update({
			_id: target._id
		}, {
			$set: {
				mailBlockedUntil: timestamp
			}
		});
	}
})

Meteor.publish('privateMailUnread', function() {
	if (this.userId) {
		// unread user letters
		return Game.Mail.Collection.find({
			owner: this.userId,
			status: game.Mail.status.unread,
			deleted: { $ne: true }
		}, {
			fields: {
				owner: 1,
				type: 1,
				from: 1,
				sender: 1,
				to: 1,
				recipient: 1,
				subject: 1,
				status: 1,
				timestamp: 1,
				complaint: 1
			},
			limit: 100
		});
	} else {
		this.ready();
	}
});

Meteor.publish('privateMailPage', function(page, count) {
	check(page, Match.Integer);
	check(count, Match.Integer);

	if (this.userId && count < 100) {
		// owned letters page for user
		return Game.Mail.Collection.find({
			owner: this.userId,
			deleted: { $ne: true }
		}, {
			fields: {
				owner: 1,
				type: 1,
				from: 1,
				sender: 1,
				to: 1,
				recipient: 1,
				subject: 1,
				status: 1,
				timestamp: 1,
				complaint: 1
			},
			sort: {
				timestamp: -1
			},
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		});
	} else {
		this.ready();
	}
});

Meteor.publish('adminMailPage', function(page, count) {
	check(page, Match.Integer);
	check(count, Match.Integer);

	if (this.userId && count < 100) {
		var user = Meteor.users.findOne({ _id: this.userId });
		if (user && ['admin', 'helper'].indexOf(user.role) >= 0) {
			console.log('published for admin!');
			// complaint letters page for admin
			return Game.Mail.Collection.find({
				complaint: true
			}, {
				fields: {
					owner: 1,
					type: 1,
					from: 1,
					sender: 1,
					to: 1,
					recipient: 1,
					subject: 1,
					status: 1,
					timestamp: 1,
					complaint: 1
				},
				sort: {
					timestamp: -1
				},
				skip: (page > 0) ? (page - 1) * count : 0,
				limit: count
			});
		} else {
			console.log('publish for admin declined!');
			this.ready();
		}
	} else {
		this.ready();
	}
});

Meteor.publish('mailSingleLetter', function(id) {
	check(id, String);

	if (this.userId) {
		var user = Meteor.users.findOne({ _id: this.userId });
		var isAdmin = user && ['admin', 'helper'].indexOf(user.role) >= 0;
		if (isAdmin) {
			// any letter for admin
			return Game.Mail.Collection.find({
				_id: id
			});
		} else {
			// only owned letter for user
			return Game.Mail.Collection.find({
				_id: id,
				owner: this.userId
			});
		}
	} else {
		this.ready();
	}
});

initMailQuizServer();

}