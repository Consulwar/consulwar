import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';
import UnitHuman from '/imports/modules/Unit/server/UnitHuman';
import humanGroundUnits from '/imports/content/Unit/Human/Ground/server';

import { Command, ResponseToGeneral } from '../lib/generals';

initEarthServerMethods = function() {
'use strict';

Meteor.methods({
  'earth.sendReinforcement': function(units, zoneName) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.sendReinforcement', user });

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

    let totalCount = 0;
    let honor = 0;

    _(units).pairs().forEach(([id, count]) => {
      count = parseInt(count, 10);
  
      const unit = humanGroundUnits[id];
  
      if (!unit || unit.type === 'mutual' || unit.getCount({ from: 'hangar' }) < count || count <= 0) {
        throw new Meteor.Error('Ишь ты, чего задумал, шакал.');
      }
  
      honor += Game.Resources.calculateHonorFromReinforcement( unit.getPrice(count) );
  
      totalCount += count;
    });

    if (totalCount === 0) {
      throw new Meteor.Error('Войска для отправки не выбраны');
    }

    if (honor > 50000) {
      Game.Broadcast.add(user.username, `Отправил подкрепление на землю на «${honor}» чести`);
    }

    // save reinforcements
    Game.Earth.addReinforcement(units, targetZoneName, user);

    // remove units
    const stats = {};
    stats['reinforcements.sent.total'] = 0;

    _(units).pairs().forEach(([id, count]) => {
      UnitHuman.remove({
        id,
        count,
      });

      stats[`reinforcements.sent.${id}`] = count;
      stats['reinforcements.sent.total'] += count;
    });

    // save statistic
    Game.Statistic.incrementUser(user._id, stats);
  },

  'earth.moveArmy': function(targetZone) {
    // check user
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.moveArmy', user });

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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.setReptileArmy', user });

    if (['admin'].indexOf(user.role) === -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    check(zoneName, String);
    check(units, Object);

    if (isOnTurn) {
      const inc = {};

      _.pairs(units).forEach(function ([id, count]) {
        inc[`army.${id}`] = count;
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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.generalCommand', user });

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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.responseToGeneral', user });

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
      Game.Broadcast.add(user.username, `Принял приказ генерала на «${earthUnits.zoneName}»`);

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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.setReptileArmy', user });

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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'earth.getEarthUnits', user });

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