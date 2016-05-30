initMailServer = function () {

initMailLib();

Game.Mail.Collection._ensureIndex({
	owner: 1,
	timestamp: -1
});

Game.Mail.Collection._ensureIndex({
	complaint: 1
});

game.Mail.addSystemMessage = function(type, subject, text, timestamp) {
	var user = Meteor.user();
	
	Game.Mail.Collection.insert({
		owner: user._id,
		type: type,
		from: 1,
		sender: 'Система',
		to: user._id,
		recipient: user.username,
		subject: subject,
		text: text,
		status: game.Mail.status.unread,
		timestamp: timestamp || Game.getCurrentTime()
	});

	Game.Statistic.incrementUser(user._id, {
		'mail.current': 1,
		'mail.total': 1
	});
};

game.Mail.sendMessageToAll = function(type, subject, text, timestamp) {
	var users = Meteor.users.find().fetch();
	var documents = [];

	for (var i = 0; i < users.length; i++) {
		documents.push({
			_id: new Meteor.Collection.ObjectID().valueOf(),
			owner: users[i]._id,
			type: type,
			from: 1,
			sender: 'Система',
			to: users[i]._id,
			recipient: users[i].username,
			subject: subject,
			text: text,
			status: game.Mail.status.unread,
			timestamp: timestamp || Game.getCurrentTime()
		});
	}

	Game.Mail.Collection.rawCollection().insert(documents, function(err, data) {});

	Game.Statistic.incrementAllUsers({
		'mail.current': 1,
		'mail.total': 1
	});
	
	return users;
};

Meteor.methods({
	'mail.sendLetter': function(recipient, subject, text) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}
		
		console.log('mail.sendLetter: ', new Date(), user.username);

		var block = Game.BanHistory.Collection.findOne({
			user_id: user._id,
			type: Game.BanHistory.type.mail
		}, {
			sort: {
				timestamp: -1
			}
		});

		if (block && Game.getCurrentTime() < block.timestamp + block.period) {
			throw new Meteor.Error('Отправка писем заблокирована', block.timestamp + block.period);
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

		if (text.length === 0) {
			throw new Meteor.Error('Напиши хоть что-нибудь!');
		}

		text = sanitizeHtml(text, {
			allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'sub', 'sup', 's', 'strike', 'blockquote' ],
			allowedAttributes: {
				'a': [ 'href' ]
			}
		}).trim();

		var parentId = null;

		if (recipient == '[all]') {

			if (['admin', 'helper'].indexOf(user.role) == -1) {
				throw new Meteor.Error('Ээ, нет. Так не пойдет.');
			}

			// insert sender copy
			parentId = Game.Mail.Collection.insert({
				owner: user._id,
				from: user._id,
				sender: user.username,
				to: '[all]',
				recipient: '[all]',
				subject: '[Рассылка] ' + subject,
				text: text,
				status: game.Mail.status.read,
				timestamp: Game.getCurrentTime()
			});

			// insert recipients copies
			var users = Meteor.users.find().fetch();
			var documents = [];

			for (var i = 0; i < users.length; i++) {
				if (users[i]._id == user._id) {
					continue;
				}

				documents.push({
					_id: new Meteor.Collection.ObjectID().valueOf(),
					owner: users[i]._id,
					parentId: parentId,
					from: user._id,
					sender: user.username,
					to: users[i]._id,
					recipient: users[i].username,
					subject: '[Рассылка] ' + subject,
					text: text,
					status: game.Mail.status.unread,
					timestamp: Game.getCurrentTime()
				});
			}

			Game.Mail.Collection.rawCollection().insert(documents, function(err, data) {});

			Game.Statistic.incrementAllUsers({
				'mail.current': 1,
				'mail.total': 1
			});

			Game.Mail.Collection.update({ _id: parentId }, {
				$set: {
					sentCount: documents.length,
					readCount: 0 
				}
			});

		} else {

			var to = Meteor.users.findOne({
				username: recipient
			}, {
				fields: {
					_id: 1,
					username: 1
				}
			});

			if (!to) {
				throw new Meteor.Error('Получателя с таким ником не существует');
			}

			// insert sender copy
			parentId = Game.Mail.Collection.insert({
				owner: user._id,
				from: user._id,
				sender: user.username,
				to: to._id,
				recipient: to.username,
				subject: subject,
				text: text,
				status: game.Mail.status.unread,
				timestamp: Game.getCurrentTime()
			});

			Game.Statistic.incrementUser(user._id, {
				'mail.current': 1,
				'mail.total': 1
			});

			if (user._id != to._id) {
				// insert recipient copy
				Game.Mail.Collection.insert({
					owner: to._id,
					parentId: parentId,
					from: user._id,
					sender: user.username,
					to: to._id,
					recipient: to.username,
					subject: subject,
					text: text,
					status: game.Mail.status.unread,
					timestamp: Game.getCurrentTime()
				});

				Game.Statistic.incrementUser(to._id, {
					'mail.current': 1,
					'mail.total': 1
				});
			}
		}
	},

	'mail.getLetter': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.getLetter: ', new Date(), user.username);

		var letter = null;

		if (['admin', 'helper'].indexOf(user.role) >= 0) {
			letter = Game.Mail.Collection.findOne({
				_id: id
			});
		} else {
			letter = Game.Mail.Collection.findOne({
				_id: id,
				owner: user._id
			});
		}

		if (letter && letter.to == user._id && letter.status == game.Mail.status.unread) {
			Game.Mail.Collection.update({ _id: id }, {
				$set: { status: game.Mail.status.read }
			});

			if (letter.parentId) {
				Game.Mail.Collection.update({ _id: letter.parentId }, {
					$set: { status: game.Mail.status.read },
					$inc: { readCount: 1 }
				});
			}
		}

		return letter;
	},

	'mail.complainLetter': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.complainLetter: ', new Date(), user.username);

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
			Game.Statistic.incrementGame({
				'mail.complaint': updateCount
			});
		}
	},

	'mail.removeLetters': function(ids) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.removeLetters: ', new Date(), user.username);

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
			Game.Statistic.incrementUser(user._id, {
				'mail.current': updateCount * -1
			});
		}
	},

	'mail.blockUser': function(options) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.blockUser: ', new Date(), user.username);

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Ээ, нет. Так не пойдет.');
		}

		if (!options || !options.username) {
			throw new Meteor.Error('Не указан обязательный параметр username');
		}

		check(options.username, String);

		var target = Meteor.users.findOne({
			username: options.username
		});

		if (!target) {
			throw new Meteor.Error('Некорректно указан логин');
		}
		
		if (options.time) {
			check(options.time, Match.Integer);
		}

		var time = options.time ? options.time : 0;

		var history = {
			user_id: target._id,
			type: Game.BanHistory.type.mail,
			who: user.username,
			timestamp: Game.getCurrentTime(),
			period: time
		};

		if (options.reason) {
			check(options.reason, String);
			history.reason = options.reason;
		}

		if (options.letterId) {
			check(options.letterId, String);
			history.letterId = options.letterId;
		}
		
		var messageText = '';
		if (time > 0) {
			messageText += 'Администратор ' + user.username + ' заблокировал вам отправку писем.' + '\n';
			messageText += 'Срок блокировки ' + Game.Helpers.formatSeconds(time);
		} else {
			messageText += 'Администратор ' + user.username + ' разблокировал вам отправку писем.';
		}
		if (options.reason) {
			messageText += 'Причина: ' + options.reason;
		}

		Game.Mail.Collection.insert({
			owner: target._id,
			from: 1,
			sender: 'Система',
			to: target._id,
			recipient: target.username,
			subject: time > 0 ? 'Отправка писем заблокирована' : 'Отправка писем разблокирована',
			text: messageText,
			status: game.Mail.status.unread,
			timestamp: Game.getCurrentTime()
		});

		Game.BanHistory.Collection.insert(history);

		Game.Statistic.incrementUser(target._id, {
			'mail.current': 1,
			'mail.total': 1
		});
	},

	'mail.resolveComplaint': function(id, resolution, comment) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.resolveComplaint: ', new Date(), user.username);

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Ээ, нет. Так не пойдет.');
		}

		check(id, String);
		check(resolution, Match.Integer);
		check(comment, String);

		Game.Mail.Collection.update({
			_id: id,
			complaint: true
		}, {
			$set: {
				resolved: true,
				resolution: resolution,
				resolutionComment: comment
			}
		});
	},

	'mail.getPrivatePage': function(page, count) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.getPrivatePage: ', new Date(), user.username);

		check(page, Match.Integer);
		check(count, Match.Integer);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		return Game.Mail.Collection.find({
			owner: user._id,
			deleted: { $ne: true }
		}, {
			fields: {
				_id: 1,
				owner: 1,
				type: 1,
				from: 1,
				sender: 1,
				to: 1,
				recipient: 1,
				subject: 1,
				status: 1,
				timestamp: 1,
				complaint: 1,
				readCount: 1,
				sentCount: 1
			},
			sort: {
				timestamp: -1
			},
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		}).fetch();
	},

	'mail.getAdminPage': function(page, count) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('mail.getAdminPage: ', new Date(), user.username);

		if (['admin', 'helper'].indexOf(user.role) == -1) {
			throw new Meteor.Error('Ээ, нет. Так не пойдет.');
		}

		check(page, Match.Integer);
		check(count, Match.Integer);

		if (count > 100) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		return Game.Mail.Collection.find({
			complaint: true
		}, {
			fields: {
				_id: 1,
				owner: 1,
				type: 1,
				from: 1,
				sender: 1,
				to: 1,
				recipient: 1,
				subject: 1,
				status: 1,
				timestamp: 1,
				complaint: 1,
				resolved: 1
			},
			sort: {
				resolved: 1,
				timestamp: -1
			},
			skip: (page > 0) ? (page - 1) * count : 0,
			limit: count
		}).fetch();
	}
});

Meteor.publish('privateMailUnread', function() {
	if (this.userId) {
		return Game.Mail.Collection.find({
			owner: this.userId,
			to: this.userId,
			status: game.Mail.status.unread,
			deleted: { $ne: true }
		}, {
			fields: {
				to: 1,
				status: 1
			},
			sort: {
				timestamp: -1
			},
			limit: 1
		});
	} else {
		this.ready();
	}
});

initMailQuizServer();

};