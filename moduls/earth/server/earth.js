import traverseGroup from '../../battle/lib/imports/traverseGroup';
import Battle from '../../battle/server/battle';

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

Game.EarthZones.Collection._ensureIndex({
  name: 1
});

Game.Earth.ReptileTurn = {
  Collection: new Meteor.Collection('earthReptileTurn')
};

Game.EarthUnits.incArmy = function (user, inc, zoneName, units) {
  Game.EarthUnits.Collection.upsert({
    user_id: user._id
  }, {
    $inc: inc,
    $setOnInsert: {
      username: user.username,
      zoneName,
    }
  });

  Game.EarthZones.Collection.update({
    name: zoneName
  }, {
    $inc: inc
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
  for (var i = 0; i < zonesAround.length; i++) {
    Game.EarthZones.Collection.update({
      name: zonesAround[i].name
    }, {
      $set: {
        isVisible: true,
        isEnemy: true,
        enemyArmy: Game.Earth.generateEnemyArmy(level)
      }
    });
  }
};

Game.Earth.nextTurn = function() {
  console.log('-------- Earth next turn start --------');

  checkInitialState();

  let earthUnitsByZone = {};
  let movedUnitsTo = {};

  Game.EarthUnits.Collection.find({}).forEach(function (army) {
    let zoneName = army.zoneName;

    if (army.targetZone) {
      Game.EarthUnits.Collection.update({
        _id: army._id
      }, {
        $set: {
          zoneName: army.targetZone
        },
        $unset: {
          targetZone: 1
        }
      });
      zoneName = army.targetZone;

      moveArmy(army, zoneName);

      if (!movedUnitsTo[zoneName]) {
        movedUnitsTo[zoneName] = [];
      }
      movedUnitsTo[zoneName].push({
        name: army.username,
        army: army.userArmy,
      });
    }

    if (!earthUnitsByZone[zoneName]) {
      earthUnitsByZone[zoneName] = {};
    }

    let userArmy = deepClone(army.userArmy);

    traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
      const unit = createUnit(armyName, typeName, unitName, count);
      userArmy[armyName][typeName][unitName] = unit;
    });

    earthUnitsByZone[zoneName][army.username] = [userArmy];
  });

  let moveReptileTo = {};

  Game.Earth.ReptileTurn.Collection.find({}).forEach(function (info) {
    if (!moveReptileTo[info.targetZone]) {
      moveReptileTo[info.targetZone] = [];
    }
    moveReptileTo[info.targetZone].push(info.army);

    let inc = {};
    _.pairs(info.army).forEach(function ([name, count]) {
      inc[`enemyArmy.reptiles.ground.${name}`] = count;
    });

    Game.EarthZones.Collection.update({
      name: info.targetZone
    }, {
      $inc: inc
    });
  });

  Game.Earth.ReptileTurn.Collection.remove({});

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
        _id: zone._id
      }, {
        $set: { battleID: battle.id }
      });
    }

    if (battle) {
      const roundResult = battle.performEarthRound({
        damageReduction: Game.Earth.DAMAGE_REDUCTION
      });

      if (battle.status === Battle.Status.finish) {
        let modifier = {
          $unset: { battleID: 1 },
          $set: {}
        };

        if (Battle.USER_SIDE in roundResult.left) {
          Game.Earth.observeZone(zone.name);
          modifier.$set.isEnemy = false;
        } else {
          modifier.$set.isEnemy = true;
        }

        Game.EarthZones.Collection.update({
          _id: zone._id
        }, modifier);
      }

      let modifier = {};

      if (Battle.USER_SIDE in roundResult.left) {
        modifier.$set = { userArmy: roundResult.left[Battle.USER_SIDE] };
      } else {
        modifier.$unset = { userArmy: 1 };
      }

      if (Battle.ENEMY_SIDE in roundResult.left) {
        if (!modifier.$set) {
          modifier.$set = {};
        }
        modifier.$set.enemyArmy = roundResult.left[Battle.ENEMY_SIDE];
      } else {
        if (!modifier.$unset) {
          modifier.$unset = {};
        }
        modifier.$unset.enemyArmy = 1 ;
      }

      Game.EarthZones.Collection.update({ _id: zone._id }, modifier);

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

      Game.EarthUnits.Collection.remove({'username':{'$in':_.keys(unsetEarthUnits)}})
    }
  });

  console.log('-------- Earth next turn end ----------');
};

const checkInitialState = function () {
  var enemyZonesCount = Game.EarthZones.Collection.find({
    isEnemy: true,
    isVisible: true
  }).count();

  if (enemyZonesCount <= 0) {
    // Only start zone is available, so try to observer nearby zones
    if (Game.Mutual.has('research', 'reccons')
      && Game.User.countActivePlayers() >= Game.Earth.MIN_ACTIVE_PLAYERS
    ) {
      const startZones = Game.EarthZones.Collection.find({
        isStarting: true
      }).fetch();

      startZones.forEach(function (zone) {
        Game.Earth.observeZone(zone.name);
      });
    } else {
      console.log('Unacceptable conditions!');
      console.log('Active players ' + Game.User.countActivePlayers() + ' of ' + Game.Earth.MIN_ACTIVE_PLAYERS);
      console.log('Mutual research is ' + Game.Mutual.has('research', 'reccons'));
    }

  }
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
  let characteristics = Game.Unit.items[armyName][typeName][unitName].characteristics;

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

Meteor.publish('zones', function () {
  if (this.userId) {
    return Game.EarthZones.Collection.find();
  }
});

Meteor.publish('earthUnits', function () {
  if (this.userId) {
    return Game.EarthUnits.Collection.find({user_id: this.userId});
  }
});

initEarthServerMethods();

};