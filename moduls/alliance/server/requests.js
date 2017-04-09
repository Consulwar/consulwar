initAllianceRequestsServer = function() {
'use strict';

initAllianceRequestsLib();

Game.Alliance.Requests.Collection._ensureIndex({
	username: 1
});

Game.Alliance.Requests.INVALIDATE_TIMEOUT = 3 * 24 * 60 * 60;
Game.Alliance.Requests.DECLINE_TIMEOUT = 30 * 24 * 60 * 60;

Game.Alliance.Requests.invalidate = function() {
	Game.Alliance.Requests.Collection.update({
		status: Game.Alliance.Requests.status.SENT,
		timestamp: {$lte: Game.getCurrentTime() - Game.Alliance.Requests.INVALIDATE_TIMEOUT}
	}, {
		status: Game.Alliance.Requests.status.INVALIDATED
	});
};

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

		if (user.alliance) {
			throw new Meteor.Error('Невозможно создать заявку', 'Вы уже состоите в альянсе');
		}

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
			throw new Meteor.Error('Невозможно создать заявку', 'Такого альянса не существует');
		}

		if (Game.Alliance.Requests.Collection.find({
				username: user.username,
				status: Game.Alliance.Requests.status.SENT
			}, {limit: 1}).count() !== 0) {
			throw new Meteor.Error('Невозможно создать заявку', 'Вы уже подали заявку ранее');
		}

		if (Game.Alliance.Requests.Collection.find({
				username: user.username,
				alliance: allianceUrl,
				status: Game.Alliance.Requests.status.DECLINED,
				timestamp: {$gt: Game.getCurrentTime() - Game.Alliance.Requests.DECLINE_TIMEOUT}
			}, {limit: 1}).count() !== 0) {
			throw new Meteor.Error('Невозможно создать заявку', 'Вам недавно отказали в заявке в этот альянс');
		}

		Game.Alliance.Requests.Collection.insert({
			username: user.username,
			user_id: user._id,
			alliance: alliance.url,
			alliance_name: alliance.name,
			mail: mail,
			status: Game.Alliance.Requests.status.SENT,
			timestamp: Game.getCurrentTime()
		});
	},

	'allianceRequests.update': function(requestId, isAccept) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceRequests.update:', new Date(), user.username);

		let request = Game.Alliance.Requests.Collection.findOne({_id: requestId});

		if (!request) {
			throw new Meteor.Error('Невозможно обновить заявку', 'Заявка не найдена');
		}

		if (request.status === Game.Alliance.Requests.status.ACCEPTED) {
			throw new Meteor.Error('Невозможно обновить заявку', 'Заявка уже принята');
		}

		if (request.status === Game.Alliance.Requests.status.DECLINED) {
			throw new Meteor.Error('Невозможно обновить заявку', 'Заявка уже отклонена');
		}

		if (request.status === Game.Alliance.Requests.status.INVALIDATED) {
			throw new Meteor.Error('Невозможно обновить заявку', 'Заявка просрочена');
		}

		let status = isAccept ? Game.Alliance.Requests.status.ACCEPTED : Game.Alliance.Requests.status.DECLINED;

		let updatedCount = Game.Alliance.Requests.Collection.update({
			_id: requestId
		}, {
			$set: {
				status: status,
				timestamp: Game.getCurrentTime()
			}
		});

		if (isAccept) {
			if (updatedCount !== 0) {
				Game.Alliance.addParticipant(request.alliance, request.username);

				let mailUser = {
					_id: request.user_id,
					username: request.username
				};
				game.Mail.addAllianceMessage(request.alliance_name, mailUser, 'subject', 'text');
			}
		}
	}
});

};