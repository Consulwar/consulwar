initAllianceReplenishmentServerMethods = function() {
'use strict';

Meteor.methods({
	'allianceReplenishment.create': function(price) {
		let user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('alliance.replenishBalance:', new Date(), user.username);

		check(price, Object);
		if (price.credits) {
			check(price.credits, Match.Integer);
		} else if (price.honor) {
			check(price.honor, Match.Integer);
		} else {
			throw new Meteor.Error('Ошибка пополнения баланса.', 'Неверный тип пополнения');
		}

		if (!user.alliance) {
			throw new Meteor.Error('Ошибка пополнения баланса', 'Вы не состоите в альянсе');
		}

		let alliance = Game.Alliance.getByUrl(user.alliance);

		let resources = Game.Resources.getValue();
		let resource = {};

		if (price.credits) {
			if (resources.credits.amount < price.credits) {
				throw new Meteor.Error('Ошибка пополнения баланса', 'Недостаточно средств');
			}
			resource.credits = price.credits;
		} else {
			if (resources.honor.amount < price.honor) {
				throw new Meteor.Error('Ошибка пополнения баланса', 'Недостаточно средств');
			}
			resource.honor = price.honor;
		}

		Game.Resources.spend(resource);

		Game.Alliance.addResource(alliance.url, resource);
		Game.Alliance.Replenishment.create(alliance, user, resource);
	}
});

};