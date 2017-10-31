import traverseGroup from '../../battle/lib/imports/traverseGroup';
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

  const battleID = Game.EarthZones.getByName(zoneName).battleID;
  if (battleID) {
    let userArmy = deepClone(units);

    traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
      const unit = createUnit(armyName, typeName, unitName, count);
      userArmy[armyName][typeName][unitName] = unit;
    });

    Battle.addGroup(battleID, Battle.USER_SIDE, user.username, userArmy);
  }
};

// Auto import on server start
// If db.zones is empty
if (Game.EarthZones.Collection.find().count() === 0) {
  Game.Earth.generateZones();
}

Game.Earth.addReinforcement = function(units, targetZoneName) {
  let army = Game.EarthUnits.get();
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

  for (var side in units) {
    for (var group in units[side]) {
      for (var name in units[side][group]) {
        var count = parseInt( units[side][group][name], 10 );
        if (count > 0) {
          honor += Game.Resources.calculateHonorFromReinforcement(
            Game.Unit.items[side][group][name].price(count)
          );
          inc['userArmy' + '.' + side + '.' + group + '.' + name ] = count;
          stats['reinforcements.arrived.' + side + '.' + group + '.' + name] = count;
          stats['reinforcements.arrived.total'] += count;
        }
      }
    }
  }

  if (stats['reinforcements.arrived.total'] > 0) {
    let user = Meteor.user();

    Game.Statistic.incrementUser(user._id, stats);

    Game.Resources.add({
      honor: honor
    });

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

  var enemies = {
    reptiles: {
      ground: {}
    }
  };

  for (var name in Game.Earth.SPAWN) {
    enemies.reptiles.ground[name] = Math.floor(
      Game.Earth.SPAWN[name] * players * difficulty * Game.Earth.SPAWN_COEFFICIENT
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

    if (zone.battleID) {
      if (movedUnitsTo[zone.name]) {
        movedUnitsTo[zone.name].forEach(function (moved) {
          let userArmy = deepClone(moved.army);

          traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
            const unit = createUnit(armyName, typeName, unitName, count);
            userArmy[armyName][typeName][unitName] = unit;
          });

          Battle.addGroup(zone.battleID, Battle.USER_SIDE, moved.name, userArmy);
        });
      }

      if (moveReptileTo[zone.name]) {
        moveReptileTo[zone.name].forEach(function (movedArmy) {
          let reptileArmy = {
            reptiles: {
              ground: {}
            }
          };
          _.pairs(movedArmy).forEach(function ([name, count]) {
            reptileArmy.reptiles.ground[name] = count;
          });

          traverseGroup(reptileArmy, function(armyName, typeName, unitName, count) {
            const unit = createUnit(armyName, typeName, unitName, count);
            reptileArmy[armyName][typeName][unitName] = unit;
          });

          Battle.addGroup(zone.battleID, Battle.ENEMY_SIDE, 'ai', reptileArmy);
        });
      }

      battle = Battle.fromDB(zone.battleID);
    } else if (zone.enemyArmy && zone.userArmy) {
      let enemyArmy = deepClone(zone.enemyArmy);

      traverseGroup(enemyArmy, function(armyName, typeName, unitName, count) {
        const unit = createUnit(armyName, typeName, unitName, count);
        enemyArmy[armyName][typeName][unitName] = unit;
      });

      battle = Battle.create(earthUnitsByZone[zone.name], {
        'ai': [enemyArmy]
      });

      Game.EarthZones.Collection.update({
        _id: zone._id,
      }, {
        $set: { battleID: battle.id },
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
      const roundResult = battle.performEarthRound({
        damageReduction: Game.Earth.DAMAGE_REDUCTION
      });

      if (battle.status === Battle.Status.finish) {
        modifier.$unset = { battleID: 1 };

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

      battle.traverse(function({unit, sideName, username, groupNum, armyName, typeName, unitName}) {
        if (sideName === Battle.ENEMY_SIDE || unit.count === 0) {
          return;
        }

        if (!leftArmies[username]) {
          leftArmies[username] = {};
        }

        if (!leftArmies[username][armyName]) {
          leftArmies[username][armyName] = {};
        }

        if (!leftArmies[username][armyName][typeName]) {
          leftArmies[username][armyName][typeName] = {};
        }

        if (!leftArmies[username][armyName][typeName][unitName]) {
          leftArmies[username][armyName][typeName][unitName] = 0;
        }

        leftArmies[username][armyName][typeName][unitName] += unit.count;

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
              userArmy: army
            }
          });
        });

        bulkOp.execute(function(err) {
          if (err) {
            console.log("Пересчет армий в зонах завершен с ошибкой", err, new Date());
          }
        });
      }

      Game.EarthUnits.Collection.remove({ username: { $in: _.keys(unsetEarthUnits) } });
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
      });
    }

    Game.EarthUnits.Collection.update({ _id: earthUnits._id }, modifier);

    if (!earthUnitsByZone[targetZoneName]) {
      earthUnitsByZone[targetZoneName] = {};
    }

    let userArmy = deepClone(earthUnits.userArmy);

    traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
      const unit = createUnit(armyName, typeName, unitName, count);
      userArmy[armyName][typeName][unitName] = unit;
    });

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

    // stage 1 - give all the players average count
    const averageValue = Math.floor(bonus.count / players.length);
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
    _.pairs(info.army).forEach(function ([name, count]) {
      inc[`enemyArmy.reptiles.ground.${name}`] = count;
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

  for (let side in units) {
    for (let group in units[side]) {
      for (let name in units[side][group]) {
        let count = Number(units[side][group][name]);
        inc['userArmy' + '.' + side + '.' + group + '.' + name ] = count;
      }
    }
  }

  let sourceZone = Game.EarthZones.getByName(army.zoneName);
  let sourceArmy = sourceZone.userArmy;
  let restArmy = {};

  for (let side in sourceArmy) {
    for (let group in sourceArmy[side]) {
      for (let name in sourceArmy[side][group]) {
        let curCount = Number(sourceArmy[side][group][name]);

        if (units[side] && units[side][group] && units[side][group][name]) {
          curCount -= Number(units[side][group][name]);
        }

        if (curCount > 0) {
          if (!restArmy[side]) {
            restArmy[side] = {};
          }
          if (!restArmy[side][group]) {
            restArmy[side][group] = {};
          }
          restArmy[side][group][name] = curCount;
        }
      }
    }
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

const createUnit = function(armyName, typeName, unitName, count) {
  let characteristics = Game.Unit.items[armyName][typeName][unitName].options.characteristics;

  return {
    count: Game.Unit.rollCount(count),
    weapon: {
      damage: {min: characteristics.weapon.damage.min, max: characteristics.weapon.damage.max},
      signature: characteristics.weapon.signature
    },
    health: {
      armor: characteristics.health.armor,
      signature: characteristics.health.signature
    }
  };
};

const deepClone = function(object) {
  let clone = _.clone(object);

  _.each(clone, function(value, key) {
    if (_.isObject(value)) {
      clone[key] = deepClone(value);
    }
  });

  return clone;
};

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