import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Space from '/imports/modules/space/lib/space';
import Reinforcement from '/imports/modules/space/server/reinforcement';

import { Command, ResponseToGeneral } from '../lib/generals';

initEarthServerMethods = function() {
'use strict';

Meteor.methods({
  'earth.sendReinforcement': function(units, cardsObject, zoneName) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.sendReinforcement');

    const currentTime = Game.getCurrentTime();

    if (!Space.canSendFleet()) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    const army = Game.EarthUnits.get();
    let targetZoneName;

    if (army) {
      targetZoneName = army.zoneName;
    } else {
      check(zoneName, String);

      const zone = Game.EarthZones.getByName(zoneName);
      if (!zone) {
        throw new Meteor.Error('Не существует указанная зона отправки.');
      }
      if (zone.isEnemy) {
        throw new Meteor.Error('Зона не доступна для отправки.');
      }
      targetZoneName = zoneName;
    }

    let cardList = [];
    let protectedHonor = 0;

    if (cardsObject) {
      check(cardsObject, Object);

      if (!Game.Cards.canUse(cardsObject, user)) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);

      if (cardList.length === 0) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      let result = Game.Effect.Special.getValue(true, { engName: 'instantReinforcement' }, cardList);

      protectedHonor = result.protectedHonor;

      if (!_.isNumber(protectedHonor) || protectedHonor <= 0) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }
    }

    let totalCount = 0;
    let honor = 0;

    for (let name in units) {
      if (units.hasOwnProperty(name)) {
        units[name] = parseInt( units[name], 10 );

        const count = units[name];
        const unit = Game.Unit.items.army.ground[name];

        if (!unit || unit.type === 'mutual' || unit.currentLevel() < count || count <= 0) {
          throw new Meteor.Error('Ишь ты, чего задумал, шакал.');
        }

        if (protectedHonor) {
          honor += Game.Resources.calculateHonorFromReinforcement( unit.price(count) );
        }

        totalCount += count;
      }
    }

    if (totalCount === 0) {
      throw new Meteor.Error('Войска для отправки не выбраны');
    }

    if (protectedHonor && honor > protectedHonor) {
      throw new Meteor.Error('Карточки нельзя применить');
    }

    // send reinforcements to current point
    Reinforcement.add({
      user_id: user._id,
      units: { army: { ground: units } },
      protectAllHonor: protectedHonor > 0,
      targetZoneName,
    });

    if (cardList.length !== 0) {
      for (let card of cardList) {
        Game.Cards.activate(card, user);
      }

      Game.Cards.spend(cardsObject);
    }

    // remove units
    const stats = {};
    stats['reinforcements.sent.total'] = 0;

    for (let name in units) {
      if (units.hasOwnProperty(name)) {
        Game.Unit.remove({
          group: 'ground',
          engName: name,
          count: units[name]
        });

        stats['reinforcements.sent.army.ground.' + name] = units[name];
        stats['reinforcements.sent.total'] += units[name];
      }
    }

    // save statistic
    Game.Statistic.incrementUser(user._id, stats);
  },

  'earth.moveArmy': function(targetZone) {
    // check user
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.moveArmy');

    check(targetZone, String);

    let earthUnits = Game.EarthUnits.get();

    if (!earthUnits) {
      throw new Meteor.Error('Армия отсутствует.');
    }

    if (earthUnits.generalCommand === ResponseToGeneral.ACCEPT) {
      throw new Meteor.Error('Вы уже приняли приказ генерала.');
    }

    if (!Game.EarthZones.getByName(targetZone)) {
      throw new Meteor.Error('Не существует указанная зона перемещения.');
    }

    let armyZone = Game.EarthZones.getByName(earthUnits.zoneName);

    if (targetZone !== earthUnits.zoneName && armyZone.links.indexOf(targetZone) === -1) {
      throw new Meteor.Error('У указанной зоны перемещения нет соединения с текущей.');
    }

    if (armyZone.battleId) {
      throw new Meteor.Error('Невозможно перемещение армий во время боя.');
    }

    const modifier = {
      $set: {},
    };

    if (earthUnits.zoneName === targetZone) {
      modifier.$set.command = Command.WAIT;
      modifier.$unset = { commandTarget: 1 };
    } else {
      modifier.$set.command = Command.MOVE;
      modifier.$set.commandTarget = targetZone;
    }

    Game.EarthUnits.Collection.update({ user_id: user._id }, modifier);
  },

  'earth.setReptileArmy': function (zoneName, modifier, units, isOnTurn) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.setReptileArmy');

    if (['admin'].indexOf(user.role) === -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    check(zoneName, String);
    check(units, Object);

    if (isOnTurn) {
      const inc = {};

      _.pairs(units).forEach(function ([unitName, count]) {
        inc[`army.${unitName}`] = count;
      });

      Game.Earth.ReptileTurn.Collection.upsert(
        {
          targetZone: zoneName,
        },
        {
          $inc: inc,
        },
      );
    } else {
      let setModifier = {};
      let unsetModifier = {};
      let setAndUnset = {};

      _.pairs(modifier).forEach(function ([key, value]) {
        if (value > 0) {
          setModifier[key] = value;
          setAndUnset.$set = setModifier;
        } else {
          unsetModifier[key] = 1;
          setAndUnset.$unset = unsetModifier;
        }
      });

      if (setAndUnset.$set || setAndUnset.$unset) {
        Game.EarthZones.Collection.update(
          {
            name: zoneName
          },
          setAndUnset,
        );
      }
    }
  },

  'earth.generalCommand'(command, commandTarget) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.generalCommand');

    const zone = Game.EarthZones.Collection.findOne({
      'general.username': user.username,
    });
    if (!zone) {
      throw new Meteor.Error('Ишь чего удумал.');
    }

    if (zone.battleId) {
      throw new Meteor.Error('Невозможна отдача приказов во время боя.');
    }

    if (zone.general.command) {
      if (zone.general.command === 'none') {
        throw new Meteor.Error('Время отдачи приказов прошло.');
      } else {
        throw new Meteor.Error('Приказ уже отдан.');
      }
    }

    check(command, String);
    check(commandTarget, Match.Maybe(String));

    if (command === Command.MOVE) {
      const set = {};

      if (commandTarget === zone.name) {
        set['general.command'] = Command.WAIT;
      } else {
        set['general.command'] = command;

        if (!Game.EarthZones.getByName(commandTarget)) {
          throw new Meteor.Error('Не существует указанная зона перемещения.');
        }

        if (zone.links.indexOf(commandTarget) === -1) {
          throw new Meteor.Error('У указанной зоны перемещения нет соединения с текущей.');
        }

        set['general.commandTarget'] = commandTarget;
      }

      Game.EarthZones.Collection.update({
        name: zone.name,
      }, {
        $set: set,
      });
    } else {
      throw new Meteor.Error('Некоректный приказ.');
    }
  },

  'earth.responseToGeneral'(isAccept) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.responseToGeneral');

    check(isAccept, Boolean);

    const earthUnits = Game.EarthUnits.get();

    if (!earthUnits) {
      throw new Meteor.Error('Армия отсутствует.');
    }

    if (earthUnits.generalCommand) {
      throw new Meteor.Error('Решение уже принято');
    }

    const zone = Game.EarthZones.getByName(earthUnits.zoneName);
    if (!zone.general || !zone.general.command || zone.general.command === Command.NONE) {
      throw new Meteor.Error('Нет приказа генерала');
    }

    if (isAccept) {
      Game.EarthUnits.Collection.update({
        _id: earthUnits._id,
      }, {
        $set: {
          generalCommand: ResponseToGeneral.ACCEPT,
          command: zone.general.command,
          commandTarget: zone.general.commandTarget,
        },
      });
    } else {
      Game.EarthUnits.Collection.update({
        _id: earthUnits._id,
      }, {
        $set: {
          generalCommand: ResponseToGeneral.DECLINE,
        },
      });
    }
  },

  'earth.setBonus'(zoneName, bonus) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.setReptileArmy');

    if (['admin'].indexOf(user.role) === -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    check(zoneName, String);
    check(bonus, Match.Maybe(Object));

    if (!bonus) {
      Game.EarthZones.Collection.update({
        name: zoneName,
      }, {
        $unset: {
          bonus: 1,
        },
      });
    } else {
      Game.EarthZones.Collection.update({
        name: zoneName,
      }, {
        $set: {
          bonus,
        },
      });
    }
  },

  'earth.getEarthUnits'(username) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'earth.getEarthUnits');

    check(username, String);

    const earthUnits = Game.EarthUnits.Collection.findOne({
      username,
    }, {
      fields: {
        userArmy: 1,
      },
    });

    if (earthUnits) {
      return earthUnits.userArmy;
    }

    return null;
  },
});

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV === 'development') {
  Meteor.methods({
    'earth.linkZones': Game.Earth.linkZones,
    'earth.unlinkZones': Game.Earth.unlinkZones,
    'earth.nextTurn': Game.Earth.nextTurn,
  });
}

};