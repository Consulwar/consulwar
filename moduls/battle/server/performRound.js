import Group from './group';
import Battle from '../lib/imports/battle.js';

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
  const battleUnits = battle.battleUnits;

  battle.everyCurrentUnit(function({ unit, sideName, id }) {
    if (unit.count === 0) {
      return;
    }

    battleUnits[sideName] = battleUnits[sideName] || {};
    if (!battleUnits[sideName][id]) {
      battleUnits[sideName][id] = {
        count: unit.count,
        weapon: {
          damage: {
            min: unit.weapon.damage.min,
            max: unit.weapon.damage.max,
          },
          signature: unit.weapon.signature,
        },
        health: {
          armor: unit.health.armor,
          signature: unit.health.signature,
          total: unit.health.armor * unit.count,
        },
      };
    } else {
      const battleUnit = battleUnits[sideName][id];

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
  const leftByUsername = {};
  let decrement = {};

  battle.everyCurrentUnit(({ unit, sideName, username, groupNum, id }) => {
    if (unit.count === 0) {
      return;
    }

    const sideBattleUnits = battleUnits[sideName];

    const battleUnit = sideBattleUnits[id];

    const alive = battleUnit.health.total / battleUnit.health.armor;

    const floatCurrentAlive = (unit.count / battleUnit.count) * alive;

    let left;

    if (Battle.isBattle1x1(battle)) {
      left = Math.ceil(floatCurrentAlive);
    } else {
      left = Math.floor(floatCurrentAlive) + Game.Random.chance((floatCurrentAlive % 1) * 100);
    }

    const killed = unit.count - left;

    unit.count = left;

    if (left > 0) {
      incToObj(leftObj, [sideName, id], left);

      if (!leftByUsername[username]) {
        leftByUsername[username] = {};
      }

      incToObj(leftByUsername[username], [id], left);
    }

    incToObj(killedObj, [sideName, id], killed);

    decrement[`currentUnits.${sideName}.${username}.${groupNum}.${id}.count`] = -killed;
  });

  return {
    left: leftObj,
    leftByUsername,
    killed: killedObj,
    decrement,
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

let calcBattleHealth = function({ battleUnits }) {
  _(battleUnits).keys().forEach((sideName) => {
    const units = battleUnits[sideName];

    _(units).pairs().forEach(([id, unit]) => {
      const battleUnit = battleUnits[sideName][id];

      if (battleUnit.count === 0) {
        battleUnit.health.total = 0;
      } else {
        const totalHP = battleUnit.health.armor * battleUnit.count;
        const killed = (totalHP - battleUnit.health.total) / battleUnit.health.armor;
        battleUnit.health.total = -(totalHP - Math.floor(killed) * unit.health.armor - battleUnit.health.total);
      }

      battleUnit.weapon.damage = { min: 0, max: 0 };
      battleUnit.weapon.signature = 0;

      battleUnit.health.armor = 0;
      battleUnit.health.signature = 0;

      battleUnit.count = 0;
    });
  });
};

export default performRound;