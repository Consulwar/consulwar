initAllianceInvitesServer = function() {
'use strict';

initAllianceInvitesLib();

Game.Alliance.Invites.Collection._ensureIndex({
	username: 1,
	alliance: 1
});

Game.Alliance.Invites.INVALIDATE_TIMEOUT = 3 * 24 * 60 * 60;

Meteor.methods({
	'allianceInvites.create': function(recipient) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceInvites.create:', new Date(), user.username);

		check(recipient, String);

		let to = Meteor.users.findOne({
			username: recipient
		}, {
			fields: {
				_id: 1,
				username: 1,
				alliance: 1
			}
		});

		if (!to) {
			throw new Meteor.Error('Невозможно создать приглашение', 'Получателя с таким ником не существует');
		}

		if (to.alliance) {
			throw new Meteor.Error('Невозможно создать приглашение', 'Игрок уже состоит в альянсе');
		}

		let alliance = Game.Alliance.Collection.findOne({owner: user._id});
		if (!alliance) {
			throw new Meteor.Error('Невозможно создать приглашение', 'Вы не являетесь владельцем альянса!');
		}

		let invite = Game.Alliance.Invites.Collection.findOne({
			username: to.username,
			alliance: alliance.url
		});

		if (invite
			&& invite.status === Game.Alliance.Invites.status.SENT
			&& invite.timestamp > Game.getCurrentTime() - Game.Alliance.Invites.INVALIDATE_TIMEOUT
		) {
			throw new Meteor.Error('Невозможно создать приглашение', 'Этому игроку уже отправлено приглашение в данный альянс!');
		}

		Game.Alliance.Invites.Collection.upsert({
			alliance: alliance.url,
			username: to.username,
			status: Game.Alliance.Invites.status.SENT,
			timestamp: Game.getCurrentTime()
		});

		game.Mail.addAllianceMessage(alliance.name, 'subject', 'text'); //todo
	},

	'allianceInvites.apply': function(allianceUrl) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceInvites.apply:', new Date(), user.username);

		let updatedCount = Game.Alliance.Invites.Collection.update({
			username: user.username,
			alliance: allianceUrl,
			status: Game.Alliance.Invites.status.SENT
		}, {
			$set: {
				status: Game.Alliance.Invites.status.ACCEPTED
			}
		});

		if (updatedCount === 0) {
			throw new Meteor.Error('Невозможно принять приглашение', 'Приглашение не найдено');
		}

		Game.Alliance.addParticipant(allianceUrl, user);
	},

	'allianceInvites.cancel': function(allianceUrl) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceInvites.cancel:', new Date(), user.username);

		let updatedCount = Game.Alliance.Invites.Collection.update({
			username: user.username,
			alliance: allianceUrl,
			status: Game.Alliance.Invites.status.SENT
		}, {
			$set: {
				status: Game.Alliance.Invites.status.DECLINED
			}
		});

		if (updatedCount === 0) {
			throw new Meteor.Error('Невозможно отменить приглашение', 'Приглашение не найдено');
		}
	}
});

};