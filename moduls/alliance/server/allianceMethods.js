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

		Game.Log('alliance.create');

		checkOptions(options);
		checkCreator(user);

		let userResources = Game.Resources.getValue();
		let firstLevel = Game.Alliance.LEVELS[1];

		if (userResources[options.priceType].amount < firstLevel.price[options.priceType]) {
			throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно средств.');
		}

		let alliance_id = Game.Alliance.create(user, options);

		let price = {
			[options.priceType]: firstLevel.price[options.priceType]
		};

		Game.Resources.spend(price);

		if (price.credits) {
			Game.Payment.Expense.log(price.credits, 'alliance_create', {
				alliance_id: alliance_id
			});
		}

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

		Game.Log('alliance.join');

		check(allianceUrl, String);

		if (contactId) {
			check(contactId, String);

			let contact = Game.Alliance.Contact.get(contactId);

			if (!contact) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Запрос не найден');
			}

			let alliance = Game.Alliance.get(contact.alliance_id);

			if (!alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Альянса из запроса не существует');
			}

			if (alliance.participants.length >= Game.Alliance.maxParticipantsByLevel(alliance.level)) {
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
					alliance: 1,
					alliance_left_ts: 1
				}
			});

			if (participant.alliance) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Игрок уже состоит в альянсе');
			}

			if (participant.alliance_left_ts
				&& participant.alliance_left_ts > Game.getCurrentTime() - Game.Alliance.LEAVING_TIMEOUT
			) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Прошло мало времени с предыдущего выхода из альянса');
			}

			Game.Alliance.Contact.accept(contactId);

			let typeName = contact.type === Game.Alliance.Contact.type.INVITE ? 'invites' : 'requests';

			Game.Statistic.incrementUser(user._id, {
				['alliance_contact.accepted_' + typeName]: 1
			});

			Game.Alliance.Contact.invalidateForUser(participant._id);

			Game.Alliance.addParticipant(alliance, participant.username);

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

			if (user.alliance_left_ts
				&& user.alliance_left_ts > Game.getCurrentTime() - Game.Alliance.LEAVING_TIMEOUT
			) {
				throw new Meteor.Error('Ошибка вступления в альянс', 'Прошло мало времени с предыдущего выхода из альянса');
			}

			Game.Alliance.addParticipant(alliance, user.username);

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

		Game.Log('alliance.leave');

		if (!user.alliance) {
			throw new Meteor.Error('Невозможно выйти из альянса', 'Вы не состоите в альянсе');
		}

		let alliance = Game.Alliance.getByName(user.alliance);

		if (alliance.owner === user.username) {
			throw new Meteor.Error('Невозможно выйти из альянса', 'Вы создатель этого альянса');
		}

		Game.Alliance.removeParticipant(alliance, user.username);

		Game.Chat.Room.removeParticipant('alliance/' + alliance.url, user);

		Game.Statistic.incrementUser(user._id, {
			'alliance.left': 1
		});

		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				alliance_left_ts: Game.getCurrentTime()
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

		Game.Log('alliance.kick');

		check(name, String);

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

		let alliance = Game.Alliance.getByName(participant.alliance);

		if (alliance.owner !== user.username) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Вы не создатель этого альянса');
		}

		if (alliance.type === Game.Alliance.type.PUBLIC) {
			throw new Meteor.Error('Ошибка при отчислении участника', 'Нельзя отчислить из публичного альянса');
		}

		Game.Alliance.removeParticipant(alliance, participant.username);

		Game.Chat.Room.removeParticipant('alliance/' + alliance.url, participant);

		Game.Statistic.incrementUser(participant._id, {
			'alliance.kicked': 1
		});

		Game.Statistic.incrementUser(user._id, {
			'alliance.kick': 1
		});
	},

	'alliance.getPosition': function(allianceUrl = null) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		let alliance;

		if (allianceUrl) {
			check(allianceUrl, String);

			alliance = Game.Alliance.getByUrl(allianceUrl);

			if (!alliance) {
				throw new Meteor.Error('Ошибка получения позиции альянса', 'Альянс не найден');
			}
		} else if (user.alliance) {
			alliance = Game.Alliance.getByName(user.alliance);
		} else {
			throw new Meteor.Error('Ошибка получения позиции альянса', 'Игрок не в альянсе');
		}

		let position = Game.Alliance.Collection.find({
			timestamp: { $lt: alliance.timestamp }
		}).count() + 1;

		let total = Game.Alliance.Collection.find({}).count();

		return {
			position,
			total
		};
	},

	'alliance.getPageInList': function(page, countPerPage) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.Log('alliance.getPageInList');

		check(page, Match.Integer);
		check(countPerPage, Match.Integer);

		if (countPerPage > Game.Alliance.COUNT_PER_PAGE) {
			throw new Meteor.Error('Много будешь знать - скоро состаришься');
		}

		let result = Game.Alliance.Collection.find({}, {
			sort: {timestamp: 1},
			fields: {
				name: 1,
				url: 1,
				timestamp: 1
			},
			skip: (page > 0) ? (page - 1) * countPerPage : 0,
			limit: countPerPage
		});

		return {
			alliances: result.fetch(),
			count: result.count()
		};
	},

	'alliance.getInfo': function(url, extended = false) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		check(url, String);

		let alliance = Game.Alliance.getByUrl(url);

		if (!alliance) {
			throw new Meteor.Error('Ошибка получения информации об альянсе', 'Альянс не найден');
		}

		let info = {
			name: alliance.name,
			information: alliance.information,
			owner: alliance.owner,
			type: alliance.type
		};

		if (extended && user.alliance === alliance.name) {
			info.balance = alliance.balance;
			info.participants = alliance.participants;
		}

		return info;
	},

	'alliance.levelUp': function(priceType) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.Log('alliance.levelUp');

		check(priceType, Match.Where(function(priceType) {
			check(priceType, String);

			if (['credits', 'honor'].indexOf(priceType) === -1) {
				throw new Match.Error('Неверный тип оплаты');
			}

			return true;
		}));

		if (!user.alliance) {
			throw new Meteor.Error('Ошибка повышения уровня альянса', 'Вы не состоите в альянсе');
		}

		let alliance = Game.Alliance.getByName(user.alliance);

		if (alliance.owner !== user.username) {
			throw new Meteor.Error('Ошибка повышения уровня альянса', 'Вы не создатель альянса');
		}

		let currentLevel = alliance.level;

		let nextLevel = Game.Alliance.LEVELS[parseInt(currentLevel, 10) + 1];

		if (!nextLevel) {
			throw new Meteor.Error('Ошибка повышения уровня альянса', 'Альянс уже максимального уровня.');
		}

		let price = nextLevel.price;
		let balance = alliance.balance;

		let count = price[priceType];

		if (balance[priceType] < count) {
			throw new Meteor.Error('Ошибка повышения уровня альянса', 'Недостаточно средств на балансе');
		}

		Game.Alliance.spendResource(alliance.url, {
			[priceType]: price[priceType]
		});

		Game.Alliance.levelUp(alliance);
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
		deleted: { $exists: false }
	});

	if (alliance) {
		throw new Meteor.Error('Невозможно создать альянс', 'Альянс с ' + (
			alliance.name === name ? 'именем ' + name : (alliance.url === url ? 'URL ' + url : 'TAG ' + tag)
		) + ' уже существует');
	}
};


};