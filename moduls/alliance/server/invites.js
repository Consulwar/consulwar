initAllianceInvitesServer = function() {
'use strict';

initAllianceInvitesLib();

Game.Alliance.Invites.Collection._ensureIndex({
	username: 1,
	alliance: 1
});

Game.Alliance.Invites.INVALIDATE_TIMEOUT = 3 * 24 * 60 * 60;

Game.Alliance.Invites.invalidate = function() {
	Game.Alliance.Invites.Collection.update({
		status: Game.Alliance.Invites.status.SENT,
		timestamp: {$lte: Game.getCurrentTime() - Game.Alliance.Invites.INVALIDATE_TIMEOUT}
	}, {
		status: Game.Alliance.Invites.status.INVALIDATED
	});
};

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

		if (Game.Alliance.Invites.Collection.find({
				username: to.username,
				alliance: alliance.url,
				status: Game.Alliance.Invites.status.SENT
			}, {limit: 1}).count() !== 0) {
			throw new Meteor.Error('Невозможно создать приглашение', 'Этому игроку уже отправлено приглашение в данный альянс!');
		}

		Game.Alliance.Invites.Collection.insert({
			alliance: alliance.url,
			username: to.username,
			user_id: to._id,
			status: Game.Alliance.Invites.status.SENT,
			timestamp: Game.getCurrentTime()
		});

		game.Mail.addAllianceMessage(alliance.name, to, 'subject', 'text');
	},

	'allianceInvites.update': function(inviteId, isApply) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceInvites.update:', new Date(), user.username);

		let invite = Game.Alliance.Invites.Collection.findOne({_id: inviteId});

		if (!invite) {
			throw new Meteor.Error('Невозможно обновить приглашение', 'Приглашение не найдено');
		}

		if (invite.status === Game.Alliance.Invites.status.ACCEPTED) {
			throw new Meteor.Error('Невозможно обновить приглашение', 'Приглашение уже принято');
		}

		if (invite.status === Game.Alliance.Invites.status.DECLINED) {
			throw new Meteor.Error('Невозможно обновить приглашение', 'Приглашение уже отклонено');
		}

		if (invite.status === Game.Alliance.Invites.status.INVALIDATED) {
			throw new Meteor.Error('Невозможно обновить приглашение', 'Приглашение просрочено');
		}

		let status = isApply ? Game.Alliance.Invites.status.ACCEPTED : Game.Alliance.Invites.status.DECLINED;

		let updatedCount = Game.Alliance.Invites.Collection.update({
			_id: inviteId
		}, {
			$set: {
				status: status,
				timestamp: Game.getCurrentTime()
			}
		});

		if (isApply && updatedCount !== 0) {
			Game.Alliance.addParticipant(invite.alliance, invite.username);
		}
	}
});

};