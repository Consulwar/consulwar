import '/imports/modules/Unit/server/api';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import unitItems from '/imports/content/Unit/server';

initUnitServer = function() {
'use strict';

initUnitLib();
initUnitServerMethods();
initUnitServerSquad();

Game.Unit.Collection._ensureIndex({
  user_id: 1
});

Game.Unit.initialize = function(user = Meteor.user()) {
  const hangarArmy = Game.Unit.getHangarArmy({ userId: user._id });
  if (hangarArmy === undefined) {
    Game.Unit.Collection.insert({
      user_id: user._id,
      location: Game.Unit.location.HOME,
      units: {},
    });
  }

  const homeFleetArmy = Game.Unit.getHomeFleetArmy({ userId: user._id });
  if (homeFleetArmy === undefined && Game.Planets.getBase(user._id)) {
    const fleetArmyId = Game.Unit.Collection.insert({
      user_id: user._id,
      location: Game.Unit.location.PLANET,
      units: {},
    });

    Game.Planets.Collection.update({
      userId: user._id,
      isHome: true,
    }, {
      $set: {
        armyId: fleetArmyId,
        armyUsername: user.username,
      },
    });
  }
};

Game.Unit.removeArmy = function(id, userId = Meteor.userId()) {
  if (
    Game.Unit.getHomeFleetArmy({ userId })._id === id ||
    Game.Unit.getHangarArmy({ userId })._id === id
  ) {
    Game.Unit.Collection.update({ _id: id }, { $set: { units: {} } });
  } else {
    Game.Unit.Collection.remove({ _id: id });
  }
};

Game.Unit.createArmy = function(units, location, user_id = Meteor.userId()) {
  var record = {};

  record.user_id = user_id;
  record.units = units;
  record.location = location;

  return Game.Unit.Collection.insert(record);
};

Game.Unit.moveArmy = function (id, location) {
  var army = Game.Unit.getArmy({ id });
  if (army) {
    army.location = location;
    Game.Unit.Collection.update({ _id: id }, army);
  }
};

Game.Unit.sliceArmy = function(sourceId, destUnits, destLocation) {
  const copyDestUnits = {};

  if (destLocation == Game.Unit.location.HOME) {
    throw new Meteor.Error('Может существовать только одна локация HOME');
  }

  var source = Game.Unit.getArmy({ id: sourceId });
  if (!source || !source.units) {
    throw new Meteor.Error('Нет армии с таким id');
  }

  var sourceUnits = { ...source.units };
  var totalCount = 0;
  var restCount = 0;
  const updateQuery = {};

  _(destUnits).pairs().forEach(([id]) => {
    if (!sourceUnits[id]) {
      throw new Meteor.Error('Неправильные входные данные.');
    }
  });

  _(sourceUnits).pairs().forEach(([id, sCount]) => {
    if (destUnits[id]) {
      let dCount = parseInt( destUnits[id], 10 );
      if (dCount > sCount) {
        dCount = sCount;
      }

      if (dCount > 0) {
        copyDestUnits[id] = dCount;

        sourceUnits[id] -= dCount;
        totalCount += dCount;
        if (sourceUnits[id] > 0) {
          if (updateQuery.$inc === undefined) {
            updateQuery.$inc = {};
          }
          updateQuery.$inc[`units.${id}`] = -dCount;
        }
        else {
          if (updateQuery.$unset === undefined) {
            updateQuery.$unset = {};
          }
          updateQuery.$unset[`units.${id}`] = '';
        }
      }
    }

    restCount += sourceUnits[id];
  });

  if (totalCount <= 0) {
    throw new Meteor.Error('Неправильные входные данные..');
  }

  // update source
  if (restCount > 0) {
    const updated = Game.Unit.Collection.update({ _id: sourceId, units: source.units }, updateQuery);
    if (!updated) {
      throw new Meteor.Error('С армией что-то произошло, пока мы пытались её разделить');
    }
  } else {
    Game.Unit.removeArmy(sourceId);
  }

  // insert new slice
  return Game.Unit.createArmy(copyDestUnits, destLocation);
};

Game.Unit.mergeArmy = function(sourceId, destId, user_id = Meteor.userId()) {
  if (sourceId == destId) {
    throw new Meteor.Error('Нельзя слить одну и ту же армию');
  }

  var source = Game.Unit.getArmy({ id: sourceId });
  var dest = Game.Unit.getArmy({ id: destId });

  if (!source || !source.units || !dest || !dest.units) {
    throw new Meteor.Error('Армии с указанными id не найдены');
  }

  if (source.location == Game.Unit.location.HOME) {
    throw new Meteor.Error('Нельзя слить домашнюю армию');
  }

  var sourceUnits = source.units;
  const updateQuery = { $inc: {} };

  _(sourceUnits).pairs().forEach(([id, sCount]) => {
    const count = parseInt(sCount, 10);

    if (count > 0) {
      updateQuery.$inc[`units.${id}`] = count;
    }
  });

  // update destination units
  const updated = Game.Unit.Collection.update({ _id: destId }, updateQuery);
  if (!updated) {
    throw new Meteor.Error('С армией что-то произошло, пока мы пытались слить её с другой');
  }

  // remove source
  Game.Unit.removeArmy(sourceId, user_id);
};

Game.Unit.rollCount = function(name) {
  if (_.isNumber(name)) {
    return name;
  }

  var count = game.Battle.countNumber[name];

  if (count) {
    return Game.Random.interval(count.min, count.max);
  } else {
    return 0;
  }
};

Game.Unit.calculateBaseArmyCost = function(army) {
  var cost = {
    metals: 0,
    crystals: 0,
    humans: 0
  };

  _(army).pairs().forEach(([id, count]) => {
    if (count <= 0) {
      return;
    }

    const price = unitItems[id].getBasePrice(count);
    if (price) {
      if (price.metals) {
        cost.metals += price.metals;
      }
      if (price.crystals) {
        cost.crystals += price.crystals;
      }
      if (price.humans) {
        cost.humans += price.humans;
      }
    }
  });

  return cost;
};

Meteor.publish('units', function () {
  if (this.userId) {
    return Game.Unit.Collection.find({user_id: this.userId});
  }
});

};