initAllianceRequestsServer = function() {
'use strict';

initAllianceRequestsLib();

Game.Alliance.Requests.Collection._ensureIndex({
	username: 1
});

Game.Alliance.Requests.Collection._ensureIndex({
	alliance: 1
});

Game.Alliance.Invites.INVALIDATE_TIMEOUT = 3 * 24 * 60 * 60;

Meteor.methods({
	'allianceRequests.create': function(allianceUrl, mail) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceRequests.create:', new Date(), user.username);

		check(allianceUrl, String);
		check(mail, Match.Where(function(mail) {
			check(mail, String);

			if (mail.length > 5000) {
				throw new Match.Error('Слишком длинный текст сопроводительного письма');
			}

			return true;
		}));

		let alliance = Game.Alliance.Collection.findOne({url: allianceUrl});
		if (!alliance) {
			throw new Meteor.Error('Невозможно создать заявку', 'Такого альянса не существует!');
		}

		if (canCreateRequest(user)) {

		}

		let request = Game.Alliance.Requests.Collection.findOne({username: user.username});

		if (!request) {
			createRequest(alliance, user, mail);
		} else if (request.status === Game.Alliance.Requests.status.SENT
			&& request.timestamp < Game.getCurrentTime() - Game.Alliance.Invites.INVALIDATE_TIMEOUT) {

		}

		if (Game.Alliance.Requests.Collection.find({
				username: user.username
			}, {limit: 1}).count() !== 0) {
			throw new Meteor.Error('Невозможно создать заявку', 'Вы уже подали заявку в этот альянс ранее!');
		}

		Game.Alliance.Requests.Collection.insert({
			alliance: alliance.url,
			username: user.username,
			mail: mail,
			status: Game.Alliance.Requests.status.SENT,
			timestamp: Game.getCurrentTime()
		});
	},

	'allianceRequests.apply': function() {

	},

	'allianceRequests.cancel': function() {

	}
});

let createRequest = function(alliance, user, mail) {
	Game.Alliance.Requests.Collection.insert({
		alliance: alliance.url,
		username: user.username,
		mail: mail,
		status: Game.Alliance.Requests.status.SENT,
		timestamp: Game.getCurrentTime()
	});
};

let canCreateRequest = function(user) {
	let request = Game.Alliance.Requests.Collection.findOne({username: user.username});
	if (!request) {
		return true;
	} else if (request.status === Game.Alliance.Requests.status.SENT
		&& request.timestamp < Game.getCurrentTime() - Game.Alliance.Invites.INVALIDATE_TIMEOUT) {

	}

	throw new Meteor.Error('Невозможно создать заявку', 'Вы уже подали заявку в этот альянс ранее!');
};

};