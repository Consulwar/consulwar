initAllianceServer = function() {
'use strict';

initAllianceLib();

Game.Alliance.Collection._ensureIndex({
	owner: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	name: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	url: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	tag: 1,
	deleted: 1
});


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

		if ( options.priceType === 'credits') {
			if (userResources.credits.amount < Game.Alliance.PRICE_IN_CREDITS) {
				throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно средств');
			}
			Game.Resources.spend({credits: Game.Alliance.PRICE_IN_CREDITS});
		} else {
			if (userResources.honor.amount < Game.Alliance.PRICE_IN_HONOR) {
				throw new Meteor.Error('Невозможно создать альянс', 'Недостаточно средств');
			}
			Game.Resources.spend({honor: Game.Alliance.PRICE_IN_HONOR});
		}

		Game.Alliance.Collection.insert({
			owner: user.username,
			name: options.name,
			url: options.url,
			tag: options.tag,
			type: options.type,
			information: options.information,
			participants: [user.username],
			timestamp: Game.getCurrentTime()
		});

		Meteor.users.update({
			_id: Meteor.userId()
		}, {
			$set: {
				alliance: options.url
			}
		});

		createChatRoom(user, options);
	},

	'alliance.enter': function(allianceUrl) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('alliance.enter:', new Date(), user.username);

		if (user.alliance) {
			throw new Meteor.Error('Вы уже состоите в альянсе');
		}

		let alliance = Game.Alliance.Collection.findOne({
			url: allianceUrl,
			deleted: { $ne: true }
		});

		if (!alliance) {
			throw new Meteor.Error('Такого альянса не существует');
		}

		if (alliance.type !== Game.Alliance.type.PUBLIC) {
			throw new Meteor.Error('Этот альянс не публичный');
		}

		Game.Alliance.addParticipant(allianceUrl, user);
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
			alliance.name === name ? 'именем ' + name	: (alliance.url === url ? 'URL ' + url : 'TAG ' + tag)
		) + ' уже существует');
	}
};

let createChatRoom = function(user, {name, url}) {
	let room = {
		name: 'alliance/' + url,
		title: name,
		owner: user._id,
		users: [user._id],
		usernames: [user.username],
		isOwnerPays: true,
		credits: 50
	};

	Game.Chat.Room.Collection.insert(room);
};

};