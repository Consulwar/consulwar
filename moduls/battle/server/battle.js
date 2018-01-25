import { Meteor } from 'meteor/meteor';

import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import User from '/imports/modules/User/lib/User';

import performRound from './performRound';
import calculateGroupPower from '../lib/imports/calculateGroupPower';
import traverseGroup from '../lib/imports/traverseGroup';

import Collection from '../lib/imports/collection';
import Lib from '../lib/imports/battle';

const {
  Status,
  USER_SIDE,
  ENEMY_SIDE,
} = Lib;

Collection._ensureIndex({
  userNames: 1,
  status: 1,
});

Meteor.publish('battles', function () {
  if (this.userId) {
    const user = User.getById({ userId: this.userId });
    return Collection.find({
      userNames: user.username,
      status: Status.progress,
    });
  }
  return null;
});

class Battle {
  static create(options, userArmies, enemyArmies) {
    const round = 0;

    const initialUnits = {
      [USER_SIDE]: userArmies,
      [ENEMY_SIDE]: enemyArmies,
    };

    const armyPowers = {};

    _.pairs(userArmies).forEach(function ([name, army]) {
      armyPowers[name] = calculateGroupPower(army[0]);
    });

    const currentUnits = Game.Helpers.deepClone(initialUnits);
    const battleUnits = {};
    const status = Status.progress;
    const userNames = _.keys(userArmies);

    const id = Collection.insert({
      options,
      status,
      timeStart: new Date(),
      round,
      userNames,
      initialUnits,
      armyPowers,
      currentUnits,
      battleUnits,
    });

    return new Battle({
      _id: id,
      options,
      initialUnits,
      armyPowers,
      currentUnits,
      battleUnits,
      round,
      userNames,
      status,
    });
  }

  static fromDB(id) {
    const battle = Collection.findOne({ _id: id });

    return new Battle(battle);
  }

  static addGroup(id, side, username, group) {
    const key = `${side}.${username}`;

    const groupPower = calculateGroupPower(group);

    const modifier = {
      $push: {
        [`initialUnits.${key}`]: group,
        [`currentUnits.${key}`]: group,
      },
    };

    if (side === USER_SIDE) {
      modifier.$addToSet = {
        userNames: username,
      };

      modifier.$inc = {
        [`armyPowers.${username}`]: groupPower,
      };
    }

    Collection.update({ _id: id }, modifier);
  }

  static removeUserArmy(id, username) {
    const key = `${USER_SIDE}.${username}`;

    const modifier = {
      $unset: {
        [`initialUnits.${key}`]: 1,
        [`currentUnits.${key}`]: 1,
        [`armyPowers.${username}`]: 1,
      },
    };

    Collection.update({ _id: id }, modifier);
  }

  constructor({
    _id,
    initialUnits,
    armyPowers,
    currentUnits,
    battleUnits,
    round,
    status,
    options,
    userNames,
  }) {
    this.id = _id;

    this.options = options;
    this.status = status;
    this.initialUnits = initialUnits;
    this.armyPowers = armyPowers;
    this.currentUnits = currentUnits;
    this.battleUnits = battleUnits;
    this.round = round;
    this.userNames = userNames;
  }

  performRound() {
    const roundResult = performRound(this, this.options.damageReduction);

    const modifier = {
      $set: {
        battleUnits: this.battleUnits,
      },
    };

    if (_.keys(roundResult.decrement).length !== 0) {
      modifier.$inc = roundResult.decrement;
    }

    this.update(modifier);

    const userArmyRest = USER_SIDE in roundResult.left;
    const enemyArmyRest = ENEMY_SIDE in roundResult.left;

    if (!this.options.isEarth) {
      this.saveRoundStatistic(roundResult);
      this.giveHonor(roundResult);
    }

    this.update({
      $inc: {
        round: 1,
      },
    });

    if (!userArmyRest || !enemyArmyRest) {
      this.finishBattle(userArmyRest, enemyArmyRest);
    }

    return roundResult;
  }

  update(modifier) {
    return Collection.update({ _id: this.id }, modifier);
  }

  giveHonor(roundResult) {
    const killedCost = Game.Unit.calculateBaseArmyCost(roundResult.killed[ENEMY_SIDE]);
    const mission = Game.Battle.items[this.options.missionType];
    const totalHonor = Game.Resources.calculateHonorFromResources(killedCost, true) *
      (mission.honor * 0.01);

    if (totalHonor > 0) {
      const armyPowers = this.armyPowers;
      const totalPower = calculateTotalPower(armyPowers);

      const dividedHonor = totalHonor / totalPower;
      const inc = {};

      _(armyPowers).pairs().forEach(([username, armyPower]) => {
        const honor = Math.floor(dividedHonor * armyPower);
        const user = Meteor.users.findOne({ username });

        Game.Resources.add({ honor }, user._id);

        inc[`reward.${username}.honor`] = honor;
      });

      this.update({ $inc: inc });
    }
  }

  saveRoundStatistic(roundResult) {
    if (this.userNames.length === 1) {
      this.saveSingleUserStatistic(roundResult);
    } else {
      this.saveMultiUsersStatistic(roundResult);
    }
  }

  saveSingleUserStatistic(roundResult) {
    const increment = {};

    const userUnits = roundResult.killed[USER_SIDE];
    let totalLost = 0;

    traverseGroup(userUnits, function(armyName, typeName, unitName, count) {
      increment[`units.lost.${armyName}.${typeName}.${unitName}`] = count;
      totalLost += count;
    });

    increment['units.lost.total'] = totalLost;

    const enemyUnits = roundResult.killed[ENEMY_SIDE];
    totalLost = 0;

    traverseGroup(enemyUnits, function(armyName, typeName, unitName, count) {
      increment[`reptiles.killed.${armyName}.${typeName}.${unitName}`] = count;
      totalLost += count;
    });

    increment['reptiles.killed.total'] = totalLost;

    const user = Meteor.users.findOne({ username: this.userNames[0] });
    Game.Statistic.incrementUser(user._id, increment);
  }

  saveMultiUsersStatistic(roundResult) {
    let increment = {};

    console.log('multiUsers', increment);
    // TODO: Game.Statistic.incrementGroupUserNames(this.userNames, increment);
  }

  finishBattle(userArmyRest, enemyArmyRest) {
    this.status = Status.finish;

    if (this.options.isOnlyDamage) {
      if (enemyArmyRest) {
        this.result = Game.Battle.result.damage;
      } else {
        this.result = Game.Battle.result.damageVictory;
      }
    } else {
      if (userArmyRest && enemyArmyRest) {
        this.result = Game.Battle.result.tie;
      } else if(userArmyRest) {
        this.result = Game.Battle.result.victory;
      } else {
        this.result = Game.Battle.result.defeat;
      }
    }

    if (!this.options.isEarth) {
      this.giveReward(userArmyRest, enemyArmyRest);
      this.saveBattleStatistic(this.result);
    }

    this.update({
      $set: {
        status: this.status,
        result: this.result,
      },
    });
  }

  giveReward(userArmyRest, enemyArmyRest) {
    this.cards = null;

    if (!userArmyRest || enemyArmyRest) {
      return;
    }

    const totalReward = {};
    const mission = Game.Battle.items[this.options.missionType].level[this.options.missionLevel];

    if (mission.reward) {
      totalReward.metals = mission.reward.metals;
      totalReward.crystals = mission.reward.crystals;
    } else {
      const killedArmy = this.calculateTotalKilled(ENEMY_SIDE);
      const killedCost = Game.Unit.calculateBaseArmyCost(killedArmy);

      totalReward.metals = Math.floor(killedCost.metals * 0.1);
      totalReward.crystals = Math.floor(killedCost.crystals * 0.1);
    }

    const armyPowers = this.armyPowers;
    const totalPower = calculateTotalPower(armyPowers);

    const dividedReward = {
      metals: totalReward.metals / totalPower,
      crystals: totalReward.crystals / totalPower,
    };

    const inc = {};

    _(armyPowers).pairs().forEach(([username, armyPower]) => {
      const reward = {
        metals: Math.floor(dividedReward.metals * armyPower),
        crystals: Math.floor(dividedReward.crystals * armyPower),
      };

      const user = Meteor.users.findOne({ username });
      Game.Resources.add(reward, user._id);

      inc[`reward.${username}.metals`] = reward.metals;
      inc[`reward.${username}.crystals`] = reward.crystals;
    });

    const names = this.userNames;

    if (mission.cards) {
      const missionCards = mission.cards;
      _(missionCards).pairs().forEach(([cardName, chance]) => {
        if (Game.Random.chance(chance)) {
          const username = names[Game.Random.interval(0, names.length - 1)];
          const user = Meteor.users.findOne({ username });

          Game.Cards.add({ [cardName]: 1 }, user._id);

          inc[`reward.${username}.card.${cardName}`] = 1;
        }
      });

      this.cards = missionCards;
    }

    this.update({ $inc: inc });
  }

  saveBattleStatistic(result) {
    const fieldName = (this.userNames.length === 1) ? 'battle' : 'multiUsersBattle';

    const increment = {};

    increment[`${fieldName}.total`] = 1;

    const resultName = Game.Battle.resultNames[result];
    increment[`${fieldName}.${resultName}`] = 1;

    if (this.options.missionType && this.options.missionLevel) {
      increment[`${fieldName}.${this.options.missionType}.total`] = 1;
      increment[`${fieldName}.${this.options.missionType}.${this.options.missionLevel}.total`] = 1;

      increment[`${fieldName}.${this.options.missionType}.${resultName}`] = 1;
      increment[`${fieldName}.${this.options.missionType}.${this.options.missionLevel}.${resultName}`] = 1;
    }

    Game.Statistic.incrementGroupUserNames(this.userNames, increment);
  }

  calculateTotalKilled(sideName) {
    const initialUnits = this.initialUnits;
    const result = {};

    traverseSide(this.currentUnits, sideName, function(username, groupNum, group) {
      traverseGroup(group, function(armyName, typeName, unitName, unit) {
        const diff = (
          initialUnits[sideName][username][groupNum][armyName][typeName][unitName].count -
          unit.count
        );

        if (diff === 0) {
          return;
        }

        if (!result[armyName]) {
          result[armyName] = {};
        }

        if (!result[armyName][typeName]) {
          result[armyName][typeName] = {};
        }

        if (!result[armyName][typeName][unitName]) {
          result[armyName][typeName][unitName] = 0;
        }

        result[armyName][typeName][unitName] += diff;
      });
    });

    return result;
  }

  getUsersKilledUnits(targetUsername) {
    const sideName = Battle.USER_SIDE;

    const initialUnits = this.initialUnits;
    const killed = {};

    traverseSide(this.currentUnits, sideName, function(username, groupNum, group) {
      if (username !== targetUsername) {
        return;
      }

      traverseGroup(group, function(armyName, typeName, unitName, unit) {
        const diff = (
          initialUnits[sideName][username][groupNum][armyName][typeName][unitName].count -
          unit.count
        );

        if (diff === 0) {
          return;
        }

        if (!killed[armyName]) {
          killed[armyName] = {};
        }

        if (!killed[armyName][typeName]) {
          killed[armyName][typeName] = {};
        }

        if (!killed[armyName][typeName][unitName]) {
          killed[armyName][typeName][unitName] = 0;
        }

        killed[armyName][typeName][unitName] += diff;
      });
    });

    return killed;
  }

  traverse(callback) {
    traverseUnits(this.currentUnits, function(sideName, username, groupNum, group){
      traverseGroup(group, function(armyName, typeName, unitName, unit) {
        callback({
          unit,
          sideName,
          username,
          groupNum,
          armyName,
          typeName,
          unitName,
        });
      });
    });
  }
}

Battle.Status = Status;
Battle.USER_SIDE = USER_SIDE;
Battle.ENEMY_SIDE = ENEMY_SIDE;
Battle.aiName = 'ai';

const calculateTotalPower = function(armyPowers) {
  let totalPower = 0;

  _(armyPowers).values().forEach((armyPower) => {
    totalPower += armyPower;
  });

  return totalPower;
};

const traverseSide = function(units, sideName, callback) {
  const side = units[sideName];

  _(side).pairs().forEach(([username, groups]) => {
    for (let groupNum = 0; groupNum < groups.length; groupNum += 1) {
      const group = groups[groupNum];

      callback(username, groupNum, group);
    }
  });
};

const traverseUnits = function(units, callback) {
  _(units).keys().forEach((sideName) => {
    traverseSide(units, sideName, function(username, groupNum, group) {
      callback(sideName, username, groupNum, group);
    });
  });
};

export default Battle;
