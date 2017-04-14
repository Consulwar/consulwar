initAllianceServerMethods = function() {
'use strict';

Meteor.methods({
	'alliance.create': function(options) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('alliance.create:', new Date(), user.username);

		checkOptions(options);
		checkCreator(user);

		let userResources = Game.Resources.getValue();

		switch (options.priceType){
			case 'credits':
				if (userResources.credits.amount < Game.Alliance.PRICE_IN_CREDITS) {
					throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно средств.');
				}
				break;

			case 'honor':
				if (userResources.honor.amount < Game.Alliance.PRICE_IN_HONOR) {
					throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно средств');
				}
				break;

			default:
				throw new Meteor.Error('Невозможно создать альянс', 'Неверный тип оплаты');
		}

		Game.Alliance.create(user, options);

		let price;
		if (options.priceType === 'credits') {
			price = {credits: Game.Alliance.PRICE_IN_CREDITS};
		} else {
			price = {honor: Game.Alliance.PRICE_IN_HONOR};
		}

		Game.Resources.spend(price);

		Game.Chat.createRoom(user, 'alliance/' + options.url, options.name, false, true, 50);

		Game.Statistic.incrementUser(user._id, {
			'alliance.created': 1
		});
	},

	'alliance.join': function(allianceUrl, contactId = null) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('alliance.join:', new Date(), user.username);

		if (contactId) {
			let contact = Game.Alliance.Contact.get(contactId);

			if (!contact) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Запрос не найден');
			}

			let alliance = Game.Alliance.get(contact.alliance_id);

			if (!alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Альянса из запроса не существует');
			}

			if (alliance.participants.length >= alliance.level * Game.Alliance.PARTICIPANTS_PER_LEVEL) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Достигнуто максимальное количество учатников');
			}

			if (contact.type === Game.Alliance.Contact.type.REQUEST) {
				if (alliance.owner !== user.username) {
					throw new Meteor.Error('Ошибка вступления в альянс', 'Вы не создатель этого альянса');
				}
			} else {
				if (contact.user_id !== user._id) {
					throw new Meteor.Error('Ошибка вступления в альянс', 'Это не ваша приглашение');
				}
			}

			let participant = Meteor.users.findOne({
				_id: contact.user_id
			}, {
				fields: {
					username: 1,
					alliance: 1
				}
			});

			if (!participant) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Игрока с таким ником не существует');
			}

			if (participant.alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Игрок уже состоит в альянсе');
			}

			Game.Alliance.Contact.accept(contactId);
			Game.Statistic.incrementUser(user._id, {
				'allianceContact.accepted': 1
			});

			Game.Alliance.Contact.invalidateForUser(participant._id);

			Game.Alliance.addParticipant(allianceUrl, participant.username);

			Game.Chat.Room.addParticipant('alliance/' + alliance.url, participant);

			Game.Statistic.incrementUser(participant._id, {
				'alliance.joined': 1
			});
		} else {
			if (user.alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Вы уже состоите в альянсе');
			}

			let alliance = Game.Alliance.getByUrl(allianceUrl);

			if (!alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Такого альянса не существует');
			}

			if (alliance.type !== Game.Alliance.type.PUBLIC) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Этот альянс не публичный');
			}

			if (alliance.participants.length >= alliance.level * Game.Alliance.PARTICIPANTS_PER_LEVEL) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Достигнуто максимальное количество учатников');
			}

			if (user.alliance_leave_ts > Game.getCurrentTime() - Game.Alliance.LEAVING_TIMEOUT) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Прошло мало времени с предыдущего выхода из альянса');
			}

			Game.Alliance.addParticipant(allianceUrl, user.username);

			Game.Chat.Room.addParticipant('alliance/' + alliance.url, user);

			Game.Statistic.incrementUser(user._id, {
				'alliance.joined': 1
			});
		}
	},

	'alliance.leave': function() {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('alliance.leave:', new Date(), user.username);

		if (!user.alliance) {
			throw new Meteor.Error('Невозможно выйти из альянса', 'Вы не состоите в альянсе');
		}

		let alliance = Game.Alliance.getByUrl(user.alliance);

		if (alliance.owner === user.username) {
			throw new Meteor.Error('Невозможно выйти из альянса', 'Вы создатель этого альянса');
		}

		Game.Alliance.removeParticipant(alliance.url, user.username);

		Game.Chat.Room.removeParticipant('alliance/' + alliance.url, user);

		Game.Statistic.incrementUser(user._id, {
			'alliance.left': 1
		});

		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				alliance_leave_ts: Game.getCurrentTime()
			}
		});
	},

	'alliance.kick': function(name) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('alliance.leave:', new Date(), user.username);

		let participant = Meteor.users.findOne({
			username: name
		}, {
			fields: {
				username: 1,
				alliance: 1
			}
		});

		if (!participant) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Игрока с таким ником не существует');
		}

		if (!participant.alliance) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Игрок не состоит в альянсе');
		}

		let alliance = Game.Alliance.getByUrl(participant.alliance);

		if (alliance.owner !== user.username) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Вы не создатель этого альянса');
		}

		if (alliance.type === Game.Alliance.type.PUBLIC) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Нельзя отчислить из публичного альянса');
		}

		Game.Alliance.removeParticipant(alliance.url, participant.username);

		Game.Chat.Room.removeParticipant('alliance/' + alliance.url, participant);

		Game.Statistic.incrementUser(participant._id, {
			'alliance.kicked': 1
		});

		Game.Statistic.incrementUser(user._id, {
			'alliance.kick': 1
		});
	}
});

let checkCreator = function(user) {
	if (user.rating < Game.Alliance.CREATOR_RATING) {
		throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно рейтинга');
	}

	if (!Game.Building.has('residential', 'alliance', Game.Alliance.CREATOR_BUILDING_LEVEL)) {
		throw new Meteor.Error('Невозможно создать альянс', 'Недостаточный уровень системы связи');
	}

	if (user.alliance) {
		throw new Meteor.Error('Невозможно создать альянс', 'Вы являетесь участником другого альянса');
	}
};

let checkOptions = function(options) {
	check(options, Match.ObjectIncluding({
		name: Match.Where(function(name) {
			check(name, String);

			if (name.length === 0) {
				throw new Meteor.Error('Название не должно быть пустым');
			}

			if (name.length > 32) {
				throw new Meteor.Error('Максимальная длинна названия 32 символов');
			}

			if (!name.match(/^[а-яА-Яa-zA-Z0-9_\- ]+$/)) {
				throw new Meteor.Error('Название может содержать пробел, тире, нижнее подчеркивание, буквы и цифры');
			}

			return true;
		}),

		url: Match.Where(function(url) {
			check(url, String);

			if (url.length === 0) {
				throw new Meteor.Error('URL альянса не должно быть пустым');
			}

			if (url.length > 32) {
				throw new Meteor.Error('URL альянса должно быть не длиннее 32 символов');
			}

			if (!url.match(/^[a-zA-Z0-9_\-]+$/)) {
				throw new Meteor.Error('URL альянса должно состоять только из латинских букв, цифр, дефисов и подчеркиваний');
			}

			return true;
		}),

		tag: Match.Where(function(tag) {
			check(tag, String);

			if (tag.length === 0) {
				throw new Meteor.Error('Таг не должен быть пустым');
			}

			if (tag.length > 5) {
				throw new Meteor.Error('Максимальная длинна тага 5 символов');
			}

			if (!tag.match(/^[a-zA-Z0-9_\-]+$/)) {
				throw new Meteor.Error('Таг альянса должен состоять только из латинских букв, цифр, дефисов и подчеркиваний');
			}

			return true;
		}),

		type: Match.Where(function(type) {
			check(type, Number);

			if (_.values(Game.Alliance.type).indexOf(type) === -1) {
				throw new Match.Error('Неверный тип альянса');
			}

			return true;
		}),

		information: Match.Where(function(information) {
			check(information, String);

			if (information.length > 5000) {
				throw new Match.Error('Слишком длинный текст информации');
			}

			return true;
		}),

		priceType: Match.Where(function(priceType) {
			check(priceType, String);

			if (['credits', 'honor'].indexOf(priceType) === -1) {
				throw new Match.Error('Неверный тип оплаты');
			}

			return true;
		})
	}));

	checkUnique(options);
};

let checkUnique = function({name, url, tag}) {
	let alliance = Game.Alliance.Collection.findOne({
		$or: [
			{name: name},
			{url: url},
			{tag: tag}
		],
		deleted: { $ne: true }
	});

	if (alliance) {
		throw new Meteor.Error('Невозможно создать альянс', 'Альянс с ' + (
			alliance.name === name ? 'именем ' + name : (alliance.url === url ? 'URL ' + url : 'TAG ' + tag)
		) + ' уже существует');
	}
};


};