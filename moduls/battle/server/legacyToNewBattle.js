import traverseGroup from '../lib/imports/traverseGroup';
import Battle from './battle';

let legacyToNewBattle = function(origUserArmy, origEnemyArmy, battleOptions) {
  let userArmy = deepClone(origUserArmy);
  let enemyArmy = deepClone(origEnemyArmy);

  traverseGroup(userArmy, function(armyName, typeName, unitName, count) {
    let unit = createUnit(armyName, typeName, unitName, count);
    userArmy[armyName][typeName][unitName] = unit;
    origUserArmy[armyName][typeName][unitName] = unit.count;
  });

  traverseGroup(enemyArmy, function(armyName, typeName, unitName, count) {
    let unit = createUnit(armyName, typeName, unitName, count);
    enemyArmy[armyName][typeName][unitName] = unit;
    origEnemyArmy[armyName][typeName][unitName] = unit.count;
  });

  let username;
  if (battleOptions.isEarth) {
    username = 'user';
  } else {
    let user = Meteor.user();
    username = user.username;
  }

  let battle = Battle.create({ [username]: [userArmy] }, { 'ai': [enemyArmy] });
  let roundResult;
  let round = 1;
  let honor = 0;
  do {
    if (battleOptions.isEarth) {
      roundResult = battle.performEarthRound(battleOptions);
    } else {
      roundResult = battle.performSpaceRound(battleOptions);
      honor += roundResult.honors[username];
    }

    round++;
  } while (round <= 3 && battle.status === Battle.Status.progress);

  let reward;
  if (battle.status !== Battle.Status.finish) {
    battle.result = Game.Battle.result.tie;
  } else if (!battleOptions.isEarth) {
    reward = battle.rewards[username];
  }

  if (honor) {
    if (reward) {
      reward.honor = honor;
    } else {
      reward = {
        honor: honor
      };
    }
  }

  let result = {
    userArmy: roundResult.left['1'],
    enemyArmy: roundResult.left['2']
  };

  let battleResults = {
    result: battle.result,
    userArmy: result.userArmy,
    enemyArmy: result.enemyArmy
  };

  if (reward) {
    battleResults.reward = reward;
  }

  if (battleOptions.artefacts && battle.result === Game.Battle.result.victory) {
    battleResults.artefacts = battleOptions.artefacts;
  }

  if (battle.cards) {
    battleResults.cards = battle.cards;
  }

  Game.BattleHistory.add(
    origUserArmy,
    origEnemyArmy,
    battleOptions,
    battleResults
  );

  return result;
};

let deepClone = function(object) {
  let clone = _.clone(object);

  _.each(clone, function(value, key) {
    if (_.isObject(value)) {
      clone[key] = deepClone(value);
    }
  });

  return clone;
};

let createUnit = function(armyName, typeName, unitName, count) {
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

export default legacyToNewBattle;