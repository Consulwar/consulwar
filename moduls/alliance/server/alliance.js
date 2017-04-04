initAllianceServer = function() {
'use strict';

initAllianceLib();

Game.Alliance.Collection._ensureIndex({
	name: 1
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

		if ( options.priceType === 'ggk') {
			if (userResources.credits.amount < Game.Alliance.PRICE_IN_GGK) {
				throw new Meteor.Error('Недостаточно средств для создания альянса');
			}
			Game.Resources.spend({credits: Game.Alliance.PRICE_IN_GGK});
		} else {
			if (userResources.honor.amount < Game.Alliance.PRICE_IN_HONOR) {
				throw new Meteor.Error('Недостаточно средств для создания альянса');
			}
			Game.Resources.spend({honor: Game.Alliance.PRICE_IN_HONOR});
		}

		Game.Alliance.Collection.insert({
			owner: user._id,
			name: options.name,
			url: options.url,
			tag: options.tag,
			type: options.type,
			information: options.information,
			timestamp: Game.getCurrentTime()
		});

		createChatRoom(user, options.name, options.url);
	}
});

let checkCreator = function(user) {
	if (user.rating < Game.Alliance.CREATOR_RATING) {
		throw new Meteor.Error('Недостаточно рейтинга для создания альянса!');
	}

	if (!Game.Building.has('residential', 'alliance', Game.Alliance.CREATOR_BUILDING_LEVEL)) {
		throw new Meteor.Error('Недостаточный уровень системы связи!');
	}

	if (Game.Alliance.Collection.find({owner: user._id}, {_id: 1, limit: 1}).count() !== 0) {
		throw new Meteor.Error('Вы являетесь владельцем другого альянса!');
	}
};

let checkOptions = function(options) {
	check(options.name, String);
	checkName(options.name);

	check(options.url, String);
	checkUrl(options.url);

	check(options.tag, String);
	checkTag(options.tag);

	check(options.type, Number);
	if (_.values(Game.Alliance.type).indexOf(options.type) === -1) {
		throw new Meteor.Error('Неверный тип альянса');
	}

	check(options.information, String);

	check(options.priceType, String);
	if (['ggk', 'honor'].indexOf(options.priceType) === -1) {
		throw new Meteor.Error('Неверный тип оплаты');
	}

	checkUnique(options);
};

let checkName = function(name) {
	if (name.length === 0) {
		throw new Meteor.Error('Название не должно быть пустым');
	}

	if (name.length > 32) {
		throw new Meteor.Error('Максимальная длинна названия 32 символов');
	}

	if (!name.match(/^[а-яА-Яa-zA-Z0-9_\- ]+$/)) {
		throw new Meteor.Error('Название может содержать пробел, тире, нижнее подчеркивание, буквы и цифры');
	}
};

let checkUrl = function(url) {
	if (url.length === 0) {
		throw new Meteor.Error('URL альянса не должно быть пустым');
	}

	if (url.length > 32) {
		throw new Meteor.Error('URL альянса должно быть не длиннее 32 символов');
	}

	if (!url.match(/^[a-zA-Z0-9_\-]+$/)) {
		throw new Meteor.Error('URL альянса должно состоять только из латинских букв, цифр, дефисов и подчеркиваний');
	}
};

let checkTag = function(tag) {
	if (tag.length === 0) {
		throw new Meteor.Error('Таг не должен быть пустым');
	}

	if (tag.length > 5) {
		throw new Meteor.Error('Максимальная длинна тага 5 символов');
	}

	if (!tag.match(/^[a-zA-Z0-9_\-]+$/)) {
		throw new Meteor.Error('Таг альянса должен состоять только из латинских букв, цифр, дефисов и подчеркиваний');
	}
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
		throw new Meteor.Error('Альянс с ' + (
			alliance.name === name ? 'именем ' + name	: (alliance.url === url ? 'URL ' + url : 'TAG ' + tag)
		) + ' уже существует');
	}
};

let createChatRoom = function(user, name, url) {
	let room = {
		name: url,
		title: name,
		owner: user._id,
		users: [user._id],
		usernames: [user.username]
	};

	Game.Chat.Room.Collection.insert(room);
};

};