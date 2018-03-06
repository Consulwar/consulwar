import Log from '/imports/modules/Log/server/Log';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';
import User from '/imports/modules/User/server/User';
import humanUnits from '/imports/content/Unit/Human/server';

import FlightEvents from '/imports/modules/Space/server/flightEvents';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Game from '/moduls/game/lib/main.game';

initUnitServerMethods = function() {
'use strict';

Meteor.methods({
  'unit.repair'(id) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.repair', user });

    check(id, String);

    Game.Wrecks.actualize();

    const wrecks = Game.Wrecks.Collection.findOne({ userId: user._id });

    if (!wrecks || !wrecks.units[id]) {
      throw new Meteor.Error('Нет юнитов для восстановления');
    }

    const count = wrecks.units[id].count;
    const unit = humanUnits[id];
    
    const price = Game.Wrecks.getPrice(unit, count);

    if (!Game.Resources.has({ resources: price })) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    unit.add({
      unit: {
        id,
        count,
      },
      user,
    });

    Game.Wrecks.removeUnit(wrecks, id);

    Game.Resources.spend(price);

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'units.repair.total': count,
      [`units.repair.${id}`]: count,
    });
  },

  'battleHistory.getPage': function(page, count, isEarth) {
    check(page, Match.Integer);
    check(count, Match.Integer);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battleHistory.getPage', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    return Game.BattleHistory.Collection.find({
      user_id: isEarth ? 'earth' : user._id
    }, {
      sort: { timestamp: -1 },
      skip: (page > 0) ? (page - 1) * count : 0,
      limit: count
    }).fetch();
  },

  'battleHistory.getById': function(id, isEarth) {
    check(id, String);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battleHistory.getById', user });

    return Game.BattleHistory.Collection.findOne({
      _id: id,
      user_id: isEarth ? 'earth' : user._id
    });
  }
});

};