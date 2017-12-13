import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';
import BattleEvents from '/imports/modules/Space/server/battleEvents';
import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

initUnitServer = function() {
'use strict';

initUnitLib();
initUnitServerMethods();
initUnitServerSquad();

Game.Unit.Collection._ensureIndex({
  user_id: 1
});

Game.Unit.set = function(unit, invertSign, uid = Meteor.userId(), location = Game.Unit.location.HOME) {
  invertSign = invertSign === true ? -1 : 1;

  Game.Unit.initialize(uid);

  var inc = {};
  inc['units.army.' + unit.group + '.' + unit.engName] = parseInt(unit.count * invertSign);

  Game.Unit.Collection.update({
    user_id: uid,
    location,
  }, {
    $inc: inc
  });

  return inc;
};

Game.Unit.add = function({
  unit,
  userId,
  user = Meteor.users.findOne({ _id: (userId || Meteor.userId()) }),
}) {
  let location;
  if (
    unit.group === 'ground' ||
    (user.settings && user.settings.options && user.settings.options.moveCompletedUnitToHangar)
  ) {
    location = Game.Unit.location.HOME;
  } else {
    const homePlanet = Game.Planets.getBase();
    const battleEvent = BattleEvents.findByPlanetId(homePlanet._id);

    if (battleEvent) {
      const userGroup = createGroup({ army: unit, userId: user._id });
      Battle.addGroup(battleEvent.data.battleId, Battle.USER_SIDE, user.username, userGroup);
      return;
    }

    location = Game.Unit.location.PLANET;
  }

  Game.Unit.set(unit, false, user._id, location);
};

Game.Unit.remove = function(unit, uid) {
  return Game.Unit.set(unit, true, uid);
};

Game.Unit.complete = function(task) {
  const user = Meteor.user();

  // save statistic
  const increment = {};
  increment['units.build.total'] = task.count;
  increment['units.build.army.' + task.group + '.' + task.engName] = task.count;
  Game.Statistic.incrementUser(user._id, increment);

  Game.Unit.add({ unit: task, user });
};

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
  if (homeFleetArmy === undefined) {
    const fleetArmyId = Game.Unit.Collection.insert({
      user_id: userId,
      location: Game.Unit.location.PLANET,
      units: {},
    });

    Game.Planets.Collection.update({
      user_id: userId,
      isHome: true,
    }, {
      $set: {
        armyId: fleetArmyId,
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

  for (let side in destUnits) {
    for (let group in destUnits[side]) {
      for (let name in destUnits[side][group]) {
        if (!(
             sourceUnits[side]
          && sourceUnits[side][group]
          && sourceUnits[side][group][name]
          )
        ) {
          throw new Meteor.Error('Неправильные входные данные');
        }
      }
    }
  }

  for (let side in sourceUnits) {
    for (let group in sourceUnits[side]) {
      for (let name in sourceUnits[side][group]) {
        // subtract destination units 
        if (destUnits[side]
         && destUnits[side][group]
         && destUnits[side][group][name]
        ) {
          var count = parseInt( destUnits[side][group][name], 10 );
          if (count > sourceUnits[side][group][name]) {
            count = sourceUnits[side][group][name];
          }

          destUnits[side][group][name] = count;
          sourceUnits[side][group][name] -= count;
          totalCount += count;
        }
        
        // calculate rest units
        restCount += sourceUnits[side][group][name];
      }
    }
  }

  if (totalCount <= 0) {
    throw new Meteor.Error('Неправильные входные данные');
  }

  // update source
  if (restCount > 0) {
    Game.Unit.updateArmy(sourceId, sourceUnits);
  } else {
    Game.Unit.removeArmy(sourceId);
  }

  // insert new slice
  return Game.Unit.createArmy(destUnits, destLocation);
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

  for (var side in sourceUnits) {
    for (var group in sourceUnits[side]) {
      for (var name in sourceUnits[side][group]) {

        var count = parseInt( sourceUnits[side][group][name], 10 );

        if (!destUnits[side]) {
          destUnits[side] = {};
        }
        if (!destUnits[side][group]) {
          destUnits[side][group] = {};
        }
        if (!destUnits[side][group][name]) {
          destUnits[side][group][name] = 0;
        }

        destUnits[side][group][name] += count;
        mergeCount += count;
      }
    }
  }

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

  for (var side in army) {
    for (var group in army[side]) {
      for (var name in army[side][group]) {

        var count = Game.Unit.rollCount( army[side][group][name] );
        if (count <= 0) {
          continue;
        }

        var price = Game.Unit.items[side][group][name].getBasePrice(count);
        if (price && price.base) {
          if (price.base.metals) {
            cost.metals += price.base.metals;
          }
          if (price.base.crystals) {
            cost.crystals += price.base.crystals;
          }
          if (price.base.humans) {
            cost.humans += price.base.humans;
          }
        }
      }
    }
  }

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