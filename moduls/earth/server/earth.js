import { Meteor } from 'meteor/meteor';
import unitItems from '/imports/content/Unit/server';
import createGroup from '../../battle/lib/imports/createGroup';
import Battle from '../../battle/server/battle';
import Generals from './generals';

const Command = Generals.Command;
const ResponseToGeneral = Generals.ResponseToGeneral;

initEarthServer = function() {
'use strict';

// ----------------------------------------------------------------------------
// Для ипморта точек (когда база пустая) нужно вызвать команду в консоли
// Meteor.call('earth.importZones')
//
// Для просчета следующего хода битвы на земле команда
// Meteor.call('earth.nextTurn')
//
// Остальные отладочные команды смотри в конце файла
// moduls/earth/server/methods.js
// ----------------------------------------------------------------------------

initEarthLib();
initEarthConfigServer();
initEarthServerImportHex();

Game.EarthUnits.Collection._ensureIndex({
  user_id: 1,
});

Game.EarthUnits.Collection._ensureIndex({
  username: 1,
});

Game.EarthZones.Collection._ensureIndex({
  name: 1,
});

Game.EarthZones.Collection._ensureIndex({
  zoneName: 1,
});

Game.Earth.ReptileTurn = {
  Collection: new Meteor.Collection('earthReptileTurn')
};

Game.EarthUnits.incArmy = function (user, inc, zoneName, units) {
  Game.EarthUnits.Collection.upsert({
    user_id: user._id,
  }, {
    $inc: inc,
    $setOnInsert: {
      username: user.username,
      zoneName,
      justReinforcement: true,
    },
  });

  const usersCount = Game.EarthUnits.Collection.find({ zoneName }).count();

  Game.EarthZones.Collection.update({
    name: zoneName,
  }, {
    $inc: inc,
    $set: {
      usersCount,
    },
  });

  const battleId = Game.EarthZones.getByName(zoneName).battleId;
  if (battleId) {
    const userArmy = createGroup({ army: units, userId: user._id });

    Battle.addGroup(battleId, Battle.USER_SIDE, user.username, userArmy);
  }
};

// Auto import on server start
// If db.zones is empty
if (Game.EarthZones.Collection.find().count() === 0) {
  Game.Earth.generateZones();
}

Game.Earth.addReinforcement = function(units, targetZoneName, user = Meteor.user()) {
  let army = Game.EarthUnits.get(user._id);
  let zoneName;
  if (army) {
    zoneName = army.zoneName;
  } else {
    zoneName = targetZoneName;
  }

  var honor = 0;
  var inc = {};
  var stats = {};
  stats['reinforcements.arrived.total'] = 0;

  _(units).pairs().forEach(([id, count]) => {
    if (count > 0) {
      honor += Game.Resources.calculateHonorFromReinforcement(
        unitItems[id].getBasePrice(count),
      );
      inc[`userArmy.${id}`] = count;
      stats[`reinforcements.arrived.${id}`] = count;
      stats['reinforcements.arrived.total'] += count;
    }
  });

  inc.power = Game.Unit.calculateUnitsPower(units, true);

  if (stats['reinforcements.arrived.total'] > 0) {
    Game.Statistic.incrementUser(user._id, stats);

    Game.Resources.add({
      honor: honor,
    }, user._id);

    Game.EarthUnits.incArmy(user, inc, zoneName, units);
  }
};

Game.Earth.generateEnemyArmy = function(level) {
  // count online players
  var players = Game.User.countActivePlayers();

  if (players < Game.Earth.MIN_ACTIVE_PLAYERS) {
    players = Game.Earth.MIN_ACTIVE_PLAYERS;
  }

  // count difficulty modifier
  var difficulty = Math.pow(1.5, level);

  var enemies = {};

  for (const id in Game.Earth.SPAWN) {
    enemies[id] = Math.floor(
      Game.Earth.SPAWN[id] * players * difficulty * Game.Earth.SPAWN_COEFFICIENT
    );
  }
  // generate units
  return enemies;
};

Game.Earth.observeZone = function(name) {
  console.log('Observe zone ' + name);

  // get target zone
  var zone = Game.EarthZones.Collection.findOne({
    name: name
  });

  if (!zone) {
    throw new Meteor.Error('Точка с именем ' + name + ' не найдена');
  }

  if (!zone.links || zone.links.length === 0) {
    throw new Meteor.Error('Точка с именем ' + name + ' не связана ни с одной зоной');
  }

  // get near zones
  var zonesAround = Game.EarthZones.Collection.find({
    name: { $in: zone.links },
    isVisible: { $ne: true }
  }).fetch();

  console.log('New zones: ', zonesAround);

  // calculate difficulty level
  var visibleZones = Game.EarthZones.Collection.find({
    isVisible: true
  }).count();

  visibleZones += zonesAround.length;

  var level = Math.round(visibleZones / 5); // each 5 visible zones = 1 difficulty level
  if (level < 1) {
    level = 1; // min level
  } else if (level > 8) {
    level = 8; // max level
  }

  // mark as visible + generate enemy army at each new zone
  for (let i = 0; i < zonesAround.length; i++) {
    const modifier = {
      isVisible: true,
      isEnemy: true,
    };

    const nameI = zonesAround[i].name;

    if (!Game.EarthZones.getByName(nameI).enemyArmy) {
      modifier.enemyArmy = Game.Earth.generateEnemyArmy(level);
    }

    Game.EarthZones.Collection.update({
      name: nameI,
    }, {
      $set: modifier,
    });
  }
};

Game.Earth.nextTurn = function() {
  console.log('-------- Earth next turn start --------');

  checkInitialState();

  const earthUnitsByZone = {};
  const movedUnitsTo = {};
  moveUserArmies(earthUnitsByZone, movedUnitsTo);

  const moveReptileTo = {};
  moveReptileArmies(moveReptileTo);

  Game.EarthZones.getAll().forEach(function (zone) {
    let battle;

    if (zone.battleId) {
      if (movedUnitsTo[zone.name]) {
        movedUnitsTo[zone.name].forEach(function (moved) {
          let userArmy = createGroup({ army: moved.army, userId: moved.userId });

          Battle.addGroup(zone.battleId, Battle.USER_SIDE, moved.name, userArmy);
        });
      }

      if (moveReptileTo[zone.name]) {
        moveReptileTo[zone.name].forEach(function (movedArmy) {
          const reptileArmy = {};
          _.pairs(movedArmy).forEach(function ([id, count]) {
            reptileArmy[id] = count;
          });

          const reptileGroup = createGroup({ army: reptileArmy });

          Battle.addGroup(zone.battleId, Battle.ENEMY_SIDE, Battle.aiName, reptileGroup);
        });
      }

      battle = Battle.fromDB(zone.battleId);
    } else if (zone.enemyArmy && zone.userArmy) {
      const enemyArmy = createGroup({ army: zone.enemyArmy });
      const options = {
        isEarth: true,
        damageReduction: Game.Earth.DAMAGE_REDUCTION,
      };

      battle = Battle.create(options, earthUnitsByZone[zone.name], {
        ai: [enemyArmy],
      });

      Game.EarthZones.Collection.update({
        _id: zone._id,
      }, {
        $set: { battleId: battle.id },
      });
    } else if (zone.enemyArmy && !zone.isEnemy) {
      Game.EarthZones.Collection.update({
        _id: zone._id,
      }, {
        $set: { isEnemy: true },
      });
    } else if (zone.userArmy && zone.isEnemy) {
      Game.EarthZones.Collection.update({
        _id: zone._id,
      }, {
        $set: { isEnemy: false },
      });
    }

    let modifier = {
      $set: {
        usersCount: Game.EarthUnits.Collection.find({ zoneName: zone.name }).count(),
      },
    };

    if (battle) {
      const roundResult = battle.performRound();

      if (battle.status === Battle.Status.finish) {
        modifier.$unset = { battleId: 1 };

        if (Battle.USER_SIDE in roundResult.left) {
          Game.Earth.observeZone(zone.name);
          modifier.$set.isEnemy = false;
        } else {
          modifier.$set.isEnemy = true;
        }
      }

      if (Battle.USER_SIDE in roundResult.left) {
        modifier.$set.userArmy = roundResult.left[Battle.USER_SIDE];
      } else {
        if (!modifier.$unset) {
          modifier.$unset = {};
        }
        modifier.$unset.userArmy = 1;
      }

      if (Battle.ENEMY_SIDE in roundResult.left) {
        modifier.$set.enemyArmy = roundResult.left[Battle.ENEMY_SIDE];
      } else {
        if (!modifier.$unset) {
          modifier.$unset = {};
        }
        modifier.$unset.enemyArmy = 1;
      }

      //update units in EarthUnits for each user in the battle
      let leftArmies = {};
      let unsetEarthUnits = {};
      _.keys(battle.currentUnits[Battle.USER_SIDE]).forEach(function (name) {
        unsetEarthUnits[name] = true;
      });

      battle.everyCurrentUnit(({ unit, sideName, username, id }) => {
        if (sideName === Battle.ENEMY_SIDE || unit.count === 0) {
          return;
        }

        leftArmies[username] = leftArmies[username] || {};
        leftArmies[username][id] = (leftArmies[username][id] || 0) + unit.count;

        if (unsetEarthUnits[username]) {
          delete unsetEarthUnits[username];
        }
      });

      const pairs = _.pairs(leftArmies);

      if (pairs.length > 0) {
        let bulkOp = Game.EarthUnits.Collection.rawCollection().initializeUnorderedBulkOp();

        pairs.forEach(function ([username, army]) {
          bulkOp.find({
            username: username
          }).update({
            $set: {
              userArmy: army,
              power: Game.Unit.calculateUnitsPower(army, true)
            }
          });
        });

        bulkOp.execute(function(err) {
          if (err) {
            console.log("Пересчет армий в зонах завершен с ошибкой", err, new Date());
          }
        });
      }

      Game.EarthUnits.Collection.remove({
        username: { $in: _.keys(unsetEarthUnits) },
        zoneName: zone.name,
      });
    }

    Game.EarthZones.Collection.update({ _id: zone._id }, modifier);
  });

  Generals.reCalculate();

  console.log('-------- Earth next turn end ----------');
};

const checkInitialState = function () {
  var enemyZonesCount = Game.EarthZones.Collection.find({
    isEnemy: true,
    isVisible: true
  }).count();

  if (enemyZonesCount <= 0) {
    // Only start zone is available, so try to observer nearby zones
    if (Game.User.countActivePlayers() >= Game.Earth.MIN_ACTIVE_PLAYERS) {
      const startZones = Game.EarthZones.Collection.find({
        isStarting: true
      }).fetch();

      startZones.forEach(function (zone) {
        Game.Earth.observeZone(zone.name);
      });
    } else {
      console.log('Unacceptable conditions!');
      console.log('Active players ' + Game.User.countActivePlayers() + ' of ' + Game.Earth.MIN_ACTIVE_PLAYERS);
    }
  }
};

const moveUserArmies = function (earthUnitsByZone, movedUnitsTo) {
  const generalsCommandByZone = {};

  Game.EarthZones.Collection.find({
    'general.command': { $exists: true },
  }).forEach(function (zone) {
    generalsCommandByZone[zone.name] = {
      generalCommand: zone.general.command,
      generalCommandTarget: zone.general.commandTarget,
    };
  });

  const bonuses = {};

  Game.EarthZones.Collection.find({
    bonus: { $exists: true },
  }).forEach(function (zone) {
    bonuses[zone.name] = {
      bonus: zone.bonus,
      players: [],
    };
  });

  Game.EarthUnits.Collection.find({}).forEach(function (earthUnits) {
    let targetZoneName;

    const currentZoneName = earthUnits.zoneName;

    const { generalCommand, generalCommandTarget } =
      generalsCommandByZone[currentZoneName] || { generalCommand: Command.NONE };

    if (
      (generalCommand !== Command.NONE) &&
      (earthUnits.generalCommand === ResponseToGeneral.ACCEPT ||
      (!earthUnits.command && earthUnits.generalCommand !== ResponseToGeneral.DECLINE))
    ) {
      if (generalCommand === Command.WAIT) {
        targetZoneName = currentZoneName;
      } else {
        targetZoneName = generalCommandTarget;
      }
    } else if (earthUnits.command === Command.MOVE) {
      targetZoneName = earthUnits.commandTarget;
    } else {
      targetZoneName = currentZoneName;
    }

    let isGetBonus = false;
    if (earthUnits.generalCommand === ResponseToGeneral.DECLINE) {
      isGetBonus = false;
    } else if (generalCommand === Command.NONE) {
      isGetBonus = true;
    } else if (earthUnits.generalCommand === ResponseToGeneral.ACCEPT) {
      isGetBonus = true;
    } else if (!earthUnits.generalCommand && !earthUnits.command) {
      isGetBonus = true;
    } else if (
      earthUnits.command === generalCommand
      && earthUnits.commandTarget === generalCommandTarget
    ) {
      isGetBonus = true;
    }

    if (isGetBonus && bonuses[currentZoneName] && !earthUnits.justReinforcement) {
      bonuses[currentZoneName].players.push({
        user_id: earthUnits.user_id,
        value: 0,
      });
    }

    const modifier = {
      $unset: {
        command: 1,
        commandTarget: 1,
        generalCommand: 1,
      },
    };

    if (targetZoneName !== currentZoneName) {
      modifier.$set = {
        zoneName: targetZoneName,
      };

      moveArmy(earthUnits, targetZoneName);

      if (!movedUnitsTo[targetZoneName]) {
        movedUnitsTo[targetZoneName] = [];
      }
      movedUnitsTo[targetZoneName].push({
        name: earthUnits.username,
        army: earthUnits.userArmy,
        userId: earthUnits.user_id,
      });
    }

    Game.EarthUnits.Collection.update({ _id: earthUnits._id }, modifier);

    if (!earthUnitsByZone[targetZoneName]) {
      earthUnitsByZone[targetZoneName] = {};
    }

    let userArmy = createGroup({ army: earthUnits.userArmy, userId: earthUnits.user_id });

    earthUnitsByZone[targetZoneName][earthUnits.username] = [userArmy];
  });

  giveBonuses(bonuses);

  Game.EarthUnits.Collection.update({}, {
    $unset: {
      justReinforcement: 1,
    },
  }, {
    multi: true,
  });
};

const giveBonuses = function (bonuses) {
  _.values(bonuses).forEach(({ bonus, players }) => {
    if (players.length === 0) {
      return;
    }

    const averageValue = Math.floor(bonus.count / players.length);
    if (bonus.min > 0 && averageValue < bonus.min) {
      players.forEach((player) => {
        player.value = bonus.min;
      });
    } else {
      // stage 1 - give all the players average count
      if (averageValue > 0) {
        players.forEach((player) => {
          player.value = averageValue;
        });
      }

      // stage 2 - the rest give by shuffling players and give by by the piece
      let rest = bonus.count - (averageValue * players.length);
      if (rest > 0) {
        players = _.shuffle(players);

        let i = 0;
        while (rest > 0) {
          players[i].value += 1;
          rest -= 1;
          i += 1;
        }
      }
    }

    players.forEach(({ user_id, value }) => {
      if (value > 0) {
        const profit = createBonusObject(bonus.id, value);
        Game.Resources.addProfit(profit, user_id);
      }
    });
  });
};

const createBonusObject = function (id, value) {
  const bonusObj = {};
  const keys = id.split('.');
  const lastKey = keys.pop();
  let curObj = bonusObj;
  keys.forEach((key) => {
    curObj[key] = {};
    curObj = curObj[key];
  });
  curObj[lastKey] = value;

  return bonusObj;
};

const moveReptileArmies = function (moveReptileTo) {
  Game.Earth.ReptileTurn.Collection.find({}).forEach(function (info) {
    if (!moveReptileTo[info.targetZone]) {
      moveReptileTo[info.targetZone] = [];
    }
    moveReptileTo[info.targetZone].push(info.army);

    const inc = {};
    _.pairs(info.army).forEach(function ([id, count]) {
      inc[`enemyArmy.${id}`] = count;
    });

    Game.EarthZones.Collection.update({
      name: info.targetZone,
    }, {
      $inc: inc,
    });
  });

  Game.Earth.ReptileTurn.Collection.remove({});
};

const moveArmy = function (army, targetZoneName) {
  let units = army.userArmy;
  let inc = {};

  _(units).pairs().forEach(([id, count]) => {
    inc[`userArmy.${id}`] = parseInt(count, 10);
  });

  let sourceZone = Game.EarthZones.getByName(army.zoneName);
  let sourceArmy = sourceZone.userArmy;
  let restArmy = {};

  if (sourceArmy) { // HACK
    _(sourceArmy).pairs().forEach(([id, count]) => {
      let curCount = parseInt(count, 10);
  
      if (units[id]) {
        curCount -= parseInt(units[id], 10);
      }
  
      if (curCount > 0) {
        restArmy[id] = curCount;
      }
    });
  }

  if (_.keys(restArmy).length === 0) {
    Game.EarthZones.Collection.update({
      _id: sourceZone._id
    }, {
      $unset: {
        'userArmy': 1
      }
    });
  } else {
    Game.EarthZones.Collection.update({
      _id: sourceZone._id
    }, {
      $set: {
        userArmy: restArmy
      }
    });
  }

  Game.EarthZones.Collection.update({
    name: targetZoneName
  }, {
    $inc: inc
  });
};

if (Meteor.settings.last) {
  SyncedCron.add({
    name: 'Следующий ход битвы на Земле',
    schedule: function(parser) {
      return parser.text(Game.Earth.UPDATE_SCHEDULE);
    },
    job: function() {
      Game.Earth.nextTurn();
    }
  });
  
  SyncedCron.add({
    name: 'Завершение времени отдачи команд генералами',
    schedule(parser) {
      return parser.text(Game.Earth.TIME_TO_GENERAL_COMMAND);
    },
    job() {
      Generals.finishCommandsTime();
    },
  });
}

Meteor.publish('zones', function () {
  if (this.userId) {
    const user = Meteor.users.findOne({
      _id: this.userId,
    }, {
      fields: { role: 1 },
    });

    if (user.role === 'admin') {
      return Game.EarthZones.Collection.find();
    }

    return Game.EarthZones.Collection.find({ isVisible: true });
  }
});

Meteor.publish('earthUnits', function () {
  if (this.userId) {
    return Game.EarthUnits.Collection.find({user_id: this.userId});
  }
});

initEarthServerMethods();

};