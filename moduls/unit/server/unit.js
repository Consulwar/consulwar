import '/imports/modules/Unit/server/api';
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import BattleEvents from '/imports/modules/Space/server/battleEvents';
import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';
import User from '/imports/modules/User/lib/User';
import unitItems from '/imports/content/Unit/server';

initUnitServer = function() {
'use strict';

initUnitLib();
initUnitServerMethods();
initUnitServerSquad();

Game.Unit.Collection._ensureIndex({
  user_id: 1
});

Game.Unit.initialize = function(userId = Meteor.userId()) {
  const hangarArmy = Game.Unit.getHangarArmy({ userId });
  if (hangarArmy === undefined) {
    Game.Unit.Collection.insert({
      user_id: userId,
      location: Game.Unit.location.HOME,
      units: {},
    });
  }

  const homeFleetArmy = Game.Unit.getHomeFleetArmy({ userId });
  if (homeFleetArmy === undefined && Game.Planets.getBase(userId)) {
    const fleetArmyId = Game.Unit.Collection.insert({
      user_id: userId,
      location: Game.Unit.location.PLANET,
      units: {},
    });

    Game.Planets.Collection.update({
      userId,
      isHome: true,
    }, {
      $set: {
        armyId: fleetArmyId,
        armyUsername: User.getById({ userId }).username,
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

Game.Unit.updateArmy = function(id, units) {
  var army = Game.Unit.getArmy({ id });
  if (army) {
    army.units = units;
    Game.Unit.Collection.update({ _id: id }, army);
  }
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

  var sourceUnits = source.units;
  var totalCount = 0;
  var restCount = 0;

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
      }
    }

    restCount += sourceUnits[id];
  });

  if (totalCount <= 0) {
    throw new Meteor.Error('Неправильные входные данные..');
  }

  // update source
  if (restCount > 0) {
    Game.Unit.updateArmy(sourceId, sourceUnits);
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
  var destUnits = dest.units;
  var mergeCount = 0;

  _(sourceUnits).pairs().forEach(([id, sCount]) => {
    const count = parseInt(sCount, 10);

    if (count > 0) {
      destUnits[id] = (destUnits[id] || 0) + count;
      mergeCount += count;
    }
  });

  // remove source
  Game.Unit.removeArmy(sourceId, user_id);

  // update destination units
  if (mergeCount > 0) {
    Game.Unit.updateArmy(destId, destUnits, user_id);
  }
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

// ----------------------------------------------------------------------------
// Battle
// ----------------------------------------------------------------------------

Game.BattleHistory = {
  Collection: new Meteor.Collection('battleHistory')
};

Game.BattleHistory.Collection._ensureIndex({
  user_id: 1
});

Game.BattleHistory.Collection._ensureIndex({
  user_id: 1,
  timestamp: -1
});

Game.BattleHistory.add = function(userArmy, enemyArmy, options, battleResults) {
  var history = {
    user_id: options.isEarth ? 'earth' : Meteor.userId(),
    timestamp: options.timestamp ? options.timestamp : Game.getCurrentTime(),
    moveType: options.moveType,
    location: options.location,
    userLocation: options.userLocation,
    userArmy: userArmy,
    enemyLocation: options.enemyLocation,
    enemyArmy: enemyArmy
  };

  if (battleResults) {
    history.result = battleResults.result;
    history.userArmyRest = battleResults.userArmy;
    history.enemyArmyRest = battleResults.enemyArmy;
    if (battleResults.reward) {
      history.reward = battleResults.reward;
    }
    if (battleResults.artefacts) {
      history.artefacts = battleResults.artefacts;
    }
    if (battleResults.cards) {
      history.cards = battleResults.cards;
    }
  }
  
  return Game.BattleHistory.Collection.insert(history);
};

Game.BattleHistory.set = function(id, set) {
  Game.BattleHistory.Collection.update({
    _id: id,
    user_id: Meteor.userId()
  }, {
    $set: set
  });
};

Meteor.publish('units', function () {
  if (this.userId) {
    return Game.Unit.Collection.find({user_id: this.userId});
  }
});

};