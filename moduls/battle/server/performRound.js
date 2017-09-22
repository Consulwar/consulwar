import Group from './group';

let performRound = function(battle, damageReduction = 0) {
  if (damageReduction < 0) {
    damageReduction = 0;
  } else if (damageReduction >= 100) {
    damageReduction = 99.99;
  }
  let damageCoef = 1 - (damageReduction / 100);

  mergeGroups(battle);

  let group1 = Group.fromObject(battle.battleUnits[1]);
  let group2 = Group.fromObject(battle.battleUnits[2]);

  let damageList1 = group1.getDamageList(damageCoef);
  let damageList2 = group2.getDamageList(damageCoef);

  fire(damageList1, group2);
  fire(damageList2, group1);

  let result = recalculateCurrentCounts(battle);

  calcBattleHealth(battle);

  return result;
};

let fire = function(damageList, target) {
  for (let [unit, damage] of damageList) {
    target.receiveDamage(unit, damage);
  }
};

let mergeGroups = function(battle) {
  let battleUnits = battle.battleUnits;

  battle.traverse(function({unit, sideName, armyName, typeName, unitName}) {
    if (unit.count === 0) {
      return;
    }

    if (!battleUnits[sideName]) {
      battleUnits[sideName] = {};
    }

    if (!battleUnits[sideName][armyName]) {
      battleUnits[sideName][armyName] = {};
    }

    if (!battleUnits[sideName][armyName][typeName]) {
      battleUnits[sideName][armyName][typeName] = {};
    }

    if (!battleUnits[sideName][armyName][typeName][unitName]) {
      battleUnits[sideName][armyName][typeName][unitName] = {
        count: unit.count,
        weapon: {
          damage: {
            min: unit.weapon.damage.min,
            max: unit.weapon.damage.max
          },
          signature: unit.weapon.signature
        },
        health: {
          armor: unit.health.armor,
          signature: unit.health.signature,
          total: unit.health.armor * unit.count
        }
      };
    } else {
      let battleUnit = battleUnits[sideName][armyName][typeName][unitName];

      mergeParam(battleUnit, unit, ['weapon', 'damage', 'min']);
      mergeParam(battleUnit, unit, ['weapon', 'damage', 'max']);
      mergeParam(battleUnit, unit, ['weapon', 'signature']);

      mergeParam(battleUnit, unit, ['health', 'armor']);
      mergeParam(battleUnit, unit, ['health', 'signature']);

      battleUnit.health.total += unit.health.armor * unit.count;

      battleUnit.count += unit.count;
    }
  });
};

let mergeParam = function(unitDestination, unitSource, path) {
  let key = path.pop();

  let u1Obj = unitDestination;
  let u2Obj = unitSource;
  for (let p of path) {
    u1Obj = u1Obj[p];
    u2Obj = u2Obj[p];
  }

  u1Obj[key] = ( (u1Obj[key] * unitDestination.count + u2Obj[key] * unitSource.count) /
    (unitDestination.count + unitSource.count)
  );
};

let recalculateCurrentCounts = function(battle) {
  let battleUnits = battle.battleUnits;

  let killedObj = {};
  let leftObj = {};
  let decrement = {};

  battle.traverse(function({unit, sideName, username, groupNum, armyName, typeName, unitName}) {
    if (unit.count === 0) {
      return;
    }

    let sideBattleUnits = battleUnits[sideName];

    let battleUnit = sideBattleUnits[armyName][typeName][unitName];

    let alive = battleUnit.health.total / battleUnit.health.armor;

    let floatCurrentAlive = (unit.count / battleUnit.count) * alive;

    let left;

    let isBattle1x1 = true;
    _.values(battle.initialUnits).forEach(function (initialUnits) {
      if (_.keys(initialUnits).length > 1) {
        isBattle1x1 = false;
      }
    });

    if (isBattle1x1) {
      left = Math.ceil(floatCurrentAlive);
    } else {
      left = Math.floor(floatCurrentAlive) + Game.Random.chance((floatCurrentAlive % 1) * 100);
    }

    let killed = unit.count - left;

    unit.count = left;

    if (left > 0) {
      incToObj(leftObj, [sideName, armyName, typeName, unitName], left);
    }

    incToObj(killedObj, [sideName, armyName, typeName, unitName], killed);

    decrement[`currentUnits.${sideName}.${username}.${groupNum}.${armyName}.${typeName}.${unitName}.count`] = -killed;
  });

  return {
    left: leftObj,
    killed: killedObj,
    decrement: decrement
  };
};

let incToObj = function(obj, fields, value) {
  let key = fields.pop();

  for (let field of fields) {
    if ( !obj[field] ) {
      obj[field] = {};
    }
    obj = obj[field];
  }

  if (!obj[key]) {
    obj[key] = value;
  } else {
    obj[key] += value;
  }
};

let calcBattleHealth = function({battleUnits}) {
  for (let sideName in battleUnits) {
    if (!battleUnits.hasOwnProperty(sideName)) {
      continue;
    }

    let group = battleUnits[sideName];

    for (let armyName in group) {
      if (!group.hasOwnProperty(armyName)) {
        continue;
      }
      let army = group[armyName];

      for (let typeName in army) {
        if (!army.hasOwnProperty(typeName)) {
          continue;
        }
        let units = army[typeName];

        for (let unitName in units) {
          if (!units.hasOwnProperty(unitName)) {
            continue;
          }

          let unit = units[unitName];

          let battleUnit = battleUnits[sideName][armyName][typeName][unitName];

          if (battleUnit.count === 0) {
            battleUnit.health.total = 0;
          } else {
            let totalHP = battleUnit.health.armor * battleUnit.count;
            let killed = (totalHP - battleUnit.health.total) / battleUnit.health.armor;
            battleUnit.health.total = -(totalHP - Math.floor(killed) * unit.health.armor - battleUnit.health.total);
          }

          battleUnit.weapon.damage = {min: 0, max: 0};
          battleUnit.weapon.signature = 0;

          battleUnit.health.armor = 0;
          battleUnit.health.signature = 0;

          battleUnit.count = 0;
        }
      }
    }
  }
};

export default performRound;