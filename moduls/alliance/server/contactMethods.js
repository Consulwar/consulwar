initAllianceContactServerMethods = function() {
'use strict';

Meteor.methods({
	'allianceContact.create': function(allianceUrl, recipient, type) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceContact.create:', new Date(), user.username);

		check(allianceUrl, String);
		check(recipient, String);

		let to = Meteor.users.findOne({
			username: recipient
		}, {
			fields: {
				username: 1,
				alliance: 1
			}
		});

		if (!to) {
			throw new Meteor.Error('Невозможно создать запрос', 'Получателя с таким ником не существует');
		}

		if (to.alliance) {
			throw new Meteor.Error('Невозможно создать запрос', 'Получатель уже состоит в альянсе');
		}

		let alliance = Game.Alliance.getByUrl(allianceUrl);
		if (!alliance) {
			throw new Meteor.Error('Невозможно создать запрос', 'Такого альянса не существует');
		}

		let contact = Game.Alliance.Contact.find(to, type, alliance);
		if (contact && contact.status === Game.Alliance.Contact.status.SENT) {
			throw new Meteor.Error('Невозможно создать запрос', 'Такой запрос уже существует');
		}

		switch (type) {
			case Game.Alliance.Contact.type.INVITE:
				if (alliance.owner !== user.username) {
					throw new Meteor.Error('Невозможно создать приглашение', 'Вы не являетесь владельцем альянса!');
				}
				break;

			case Game.Alliance.Contact.type.REQUEST:
				if (alliance.type !== Game.Alliance.type.OPEN) {
					throw new Meteor.Error('Невозможно создать заявку', 'Альянс не открытого типа.');
				}

				if (contact
					&& contact.status === Game.Alliance.Contact.status.DECLINED
					&& contact.alliance_id === alliance._id
					&& contact.timestamp > Game.getCurrentTime() - Game.Alliance.Contact.DECLINE_TIMEOUT
				) {
					throw new Meteor.Error('Невозможно создать заявку', 'Вам недавно отказали в заявке в этот альянс');
				}
				break;

			default:
				throw new Meteor.Error('Невозможно создать запрос', 'Ошибка в типе');
		}

		Game.Alliance.Contact.create(alliance, to, type);

		let typeName = type === Game.Alliance.Contact.type.INVITE ? 'invites' : 'requests';

		Game.Statistic.incrementUser(user._id, {
			['alliance_contact.created_' + typeName]: 1
		});
	},

	'allianceContact.decline': function(contactId) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('allianceContact.update:', new Date(), user.username);

		let contact = Game.Alliance.Contact.get(contactId);

		if (!contact) {
			throw new Meteor.Error('Ошибка в отклонении заявки', 'Заявка не найден');
		}

		let alliance = Game.Alliance.get(contact.alliance_id);

		if (!alliance) {
			throw new Meteor.Error('Ошибка в отклонении заявки', 'Такого альянса не существует');
		}

		let who = Meteor.users.findOne({
			_id: contact.user_id
		}, {
			fields: {
				username: 1
			}
		});

		if (contact.type === Game.Alliance.Contact.type.REQUEST && alliance.owner !== user.username) {
			throw new Meteor.Error('Ошибка в отклонении заявки', 'Вы не создатель этого альянса');
		}

		Game.Alliance.Contact.decline(contactId);

		let typeName = contact.type === Game.Alliance.Contact.type.INVITE ? 'invites' : 'requests';

		Game.Statistic.incrementUser(user._id, {
			['alliance_contact.decline_' + typeName]: 1
		});

		Game.Statistic.incrementUser(who._id, {
			['alliance_contact.declined_' + typeName]: 1
		});
	}
});

};