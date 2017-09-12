initAllianceReplenishmentHistoryServerMethods = function() {
'use strict';

Meteor.methods({
  'allianceReplenishmentHistory.create': function(resource) {
    let user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован.');
    }

    Game.Log.method('allianceReplenishmentHistory.create');

    check(resource, Match.OneOf({
      honor: Match.Integer,
      credits: Match.Optional(Match.Integer)
    }, {
      honor: Match.Optional(Match.Integer),
      credits: Match.Integer
    }));

    if (!user.alliance) {
      throw new Meteor.Error('Ошибка пополнения баланса', 'Вы не состоите в альянсе');
    }

    let alliance = Game.Alliance.getByName(user.alliance);

    let resources = Game.Resources.getValue();

    for (let name in resource) {
      if (resource.hasOwnProperty(name)) {
        let count = resource[name];

        if (count <= 0) {
          throw new Meteor.Error('Ошибка пополнения баланса', 'Неверная сумма пополнения');
        }

        if (resources[name].amount < count) {
          throw new Meteor.Error('Ошибка пополнения баланса', 'Недостаточно средств');
        }
      }
    }

    Game.Resources.spend(resource);

    if (resource.credits) {
      Game.Payment.Expense.log(resource.credits, 'alliance_replenishment', {
        alliance_id: alliance._id
      });
    }

    Game.Alliance.addResource(alliance.url, resource);
    Game.Alliance.ReplenishmentHistory.create(alliance, user, resource);
  }
});

};