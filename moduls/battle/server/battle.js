import { Meteor } from 'meteor/meteor';

import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import User from '/imports/modules/User/lib/User';
import content from '/imports/content/server';

import performRound from './performRound';
import calculateGroupPower from '../lib/imports/calculateGroupPower';

import Collection from '../lib/imports/collection';
import Lib from '../lib/imports/battle';

const {
  Status,
  USER_SIDE,
  ENEMY_SIDE,
  aiName,
} = Lib;

Collection._ensureIndex({
  status: 1,
  userNames: 1,
});

Collection._ensureIndex({
  'options.isEarth': 1,
  userNames: 1,
  timeStart : -1,
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

      if (!this.options.noReward) {
        this.giveHonor(roundResult);
      }
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

    if (userUnits) {
      _(userUnits).pairs().forEach(([id, count]) => {
        increment[`units.lost.${id}`] = count;
        totalLost += count;
      });
  
      increment['units.lost.total'] = totalLost;
    }

    const enemyUnits = roundResult.killed[ENEMY_SIDE];
    totalLost = 0;

    if (enemyUnits) {
      _(enemyUnits).pairs().forEach(([id, count]) => {
        increment[`reptiles.killed.${id}`] = count;
        totalLost += count;
      });
  
      increment['reptiles.killed.total'] = totalLost;
    }

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
      if (!this.options.noReward) {
        this.giveReward(userArmyRest, enemyArmyRest);
      }
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
      if (mission.reward.humans) {
        totalReward.humans = mission.reward.humans;
      }
      if (mission.reward.honor) {
        totalReward.honor = mission.reward.honor;
      }
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

    if (totalReward.humans) {
      dividedReward.humans = totalReward.humans / totalPower;
    }
    if (totalReward.honor) {
      dividedReward.honor = totalReward.honor / totalPower;
    }

    const inc = {};

    _(armyPowers).pairs().forEach(([username, armyPower]) => {
      let reward = {
        resources: {
          metals: Math.floor(dividedReward.metals * armyPower),
          crystals: Math.floor(dividedReward.crystals * armyPower),
        },
      };

      if (dividedReward.humans) {
        reward.resources.humans = Math.floor(dividedReward.humans * armyPower);
      }

      if (dividedReward.honor) {
        reward.resources.honor = Math.floor(dividedReward.honor * armyPower);
      }

      inc[`reward.${username}.metals`] = reward.resources.metals;
      inc[`reward.${username}.crystals`] = reward.resources.crystals;
      if (dividedReward.humans) {
        inc[`reward.${username}.humans`] = reward.resources.humans;
      }
      if (dividedReward.honor) {
        inc[`reward.${username}.honor`] = reward.resources.honor;
      }
      if (this.options.missionType === 'prisoners') {
        if (Game.Random.chance(100 * armyPower / totalPower)) {
          inc[`reward.${username}.ruby_plasmoid`] = 1;
          reward.resources.ruby_plasmoid = 1;
        }
      } else if (this.options.missionType === 'krampussy') {
        reward = Game.Resources.rollProfit(Meteor.settings.space.krampussy.rewards);
        const rewardGroup = reward[Object.keys(reward)[0]];
        const rewardId = Object.keys(rewardGroup)[0];
        inc[`reward.${username}.${rewardId}`] = rewardGroup[rewardId];

        Game.Broadcast.add(
          username,
          `выбил ${rewardGroup[rewardId]} ${content[rewardId].title}`,
        );
      }

      const user = Meteor.users.findOne({ username });
      Game.Resources.addProfit(reward, user._id);
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
    const result = {};

    _(this.currentUnits[sideName]).pairs().forEach(([username, group]) => {
      group.forEach((units, groupNum) => {
        _(units).pairs().forEach(([id, unit]) => {
          const diff = (
            this.initialUnits[sideName][username][groupNum][id].count -
            unit.count
          );

          if (diff === 0) {
            return;
          }

          result[id] = (result[id] || 0) + diff;
        });
      });
    });

    return result;
  }

  getUsersKilledUnits(targetUsername) {
    const sideName = Battle.USER_SIDE;

    const killed = {};

    _(this.currentUnits[sideName]).pairs().forEach(([username, group]) => {
      if (username !== targetUsername) {
        return;
      }

      group.forEach((units, groupNum) => {
        _(units).pairs().forEach(([id, unit]) => {
          const diff = (
            this.initialUnits[sideName][username][groupNum][id].count -
            unit.count
          );

          if (diff === 0) {
            return;
          }

          killed[id] = (killed[id] || 0) + diff;
        });
      });
    });

    return killed;
  }

  everyCurrentUnit(callback) {
    _(this.currentUnits).pairs().forEach(([sideName, participants]) => {
      _(participants).pairs().forEach(([username, group]) => {
        group.forEach((units, groupNum) => {
          _(units).pairs().forEach(([id, unit]) => {
            callback({
              unit,
              sideName,
              username,
              groupNum,
              id,
            });
          });
        });
      });
    });
  }
}

Battle.Status = Status;
Battle.USER_SIDE = USER_SIDE;
Battle.ENEMY_SIDE = ENEMY_SIDE;
Battle.aiName = aiName;

const calculateTotalPower = function(armyPowers) {
  let totalPower = 0;

  _(armyPowers).values().forEach((armyPower) => {
    totalPower += armyPower;
  });

  return totalPower;
};

export default Battle;
