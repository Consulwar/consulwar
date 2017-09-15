import performRound from './performRound';
import calculateGroupPower from '../lib/imports/calculateGroupPower';
import traverseGroup from '../lib/imports/traverseGroup';

let Collection = new Meteor.Collection('battle');

Collection._ensureIndex({
  userNames: 1
});

const Status = {
  progress: 1,
  finish: 2
};

const USER_SIDE = '1';
const ENEMY_SIDE = '2';

class Battle {
  static create(userArmies, enemyArmies) {
    let round = 1;

    let initialUnits = {
      [USER_SIDE]: userArmies,
      [ENEMY_SIDE]: enemyArmies
    };

    let armyPowers = {};

    _.pairs(userArmies).forEach(function ([name, army]) {
      armyPowers[name] = calculateGroupPower(army[0]);
    });

    let currentUnits = deepClone(initialUnits);
    let battleUnits = {};
    let status = Status.progress;

    let id = Collection.insert({
      status: status,
      timeStart: new Date(),
      round: round,
      userNames: _.keys(userArmies),
      initialUnits,
      armyPowers,
      currentUnits,
      battleUnits
    });

    return new Battle({_id: id, initialUnits, armyPowers, currentUnits, battleUnits, round, status});
  }

  static fromDB(id) {
    let battle = Collection.findOne({_id: id});

    return new Battle(battle);
  }

  static findForUsername(username) {
    return Collection.find({userNames: username}).fetch();
  }

  static addGroup(id, side, username, group) {
    let key = `${side}.${username}`;

    let groupPower = calculateGroupPower(group);

    let modifier = {
      $push: {
        [`initialUnits.${key}`]: group,
        [`currentUnits.${key}`]: group
      }
    };

    if (side === USER_SIDE) {
      modifier.$addToSet = {
        userNames: username
      };

      modifier.$inc = {
        [`armyPowers.${username}`]: groupPower
      };
    }

    Collection.update({_id: id}, modifier);
  }

  static removeUserArmy(id, username) {
    const key = `${USER_SIDE}.${username}`;

    const modifier = {
      $unset: {
        [`initialUnits.${key}`]: 1,
        [`currentUnits.${key}`]: 1,
        [`armyPowers.${username}`]: 1,
      }
    };

    Collection.update({_id: id}, modifier);
  }

  constructor({_id, initialUnits, armyPowers, currentUnits, battleUnits, round, status}) {
    this.id = _id;

    this.status = status;
    this.initialUnits = initialUnits;
    this.armyPowers = armyPowers;
    this.currentUnits = currentUnits;
    this.battleUnits = battleUnits;
    this.round = round;
  }

  performSpaceRound(options) {
    let roundResult = this.performRound(options);

    roundResult.honors = this.giveHonor(roundResult, options);

    return roundResult;
  }

  performEarthRound(options) {
    options.isEarth = true;
    return this.performRound(options);
  }

  performRound(options) {
    let roundResult = performRound(this, options.damageReduction);

    let modifier = {
      $set: {
        battleUnits: this.battleUnits
      }
    };

    if (_.keys(roundResult.decrement).length !== 0) {
      modifier.$inc = roundResult.decrement;
    }

    this.update(modifier);

    let userArmyRest = USER_SIDE in roundResult.left;
    let enemyArmyRest = ENEMY_SIDE in roundResult.left;

    if (!options.isEarth) {
      this.saveRoundStatistic(roundResult);
    }

    if (!userArmyRest || !enemyArmyRest) {
      this.finishBattle(userArmyRest, enemyArmyRest, options);
    } else {
      this.update({
        $inc: {
          round: 1
        }
      });
    }

    return roundResult;
  }

  update(modifier) {
    return Collection.update({_id: this.id}, modifier);
  }

  giveHonor(roundResult, options) {
    let honors = {};

    let killedCost = Game.Unit.calculateArmyCost(roundResult.killed[ENEMY_SIDE]);
    let mission = Game.Battle.items[ options.missionType ];
    let totalHonor = (getPoints(killedCost) / 100) * (mission.honor * 0.01);

    if (totalHonor > 0) {
      let armyPowers = this.armyPowers;
      let totalPower = calculateTotalPower(armyPowers);

      let dividedHonor = totalHonor / totalPower;

      for (let username in armyPowers) {
        if (armyPowers.hasOwnProperty(username)) {
          let honor = Math.floor(dividedHonor * armyPowers[username]);
          let user = Meteor.users.findOne({username});

          Game.Resources.add({honor}, user._id);

          honors[username] = honor;
        }
      }
    }

    return honors;
  }

  saveRoundStatistic(roundResult) {
    if (_.keys(this.currentUnits[USER_SIDE]).length === 1) {
      this.saveSingleUserStatistic(roundResult);
    } else {
      this.saveMultiUsersStatistic(roundResult);
    }
  }

  saveSingleUserStatistic(roundResult) {
    let increment = {};

    let userUnits = roundResult.killed[USER_SIDE];
    let totalLost = 0;

    traverseGroup(userUnits, function(armyName, typeName, unitName, count) {
      increment[`units.lost.${armyName}.${typeName}.${unitName}`] = count;
      totalLost += count;
    });

    increment['units.lost.total'] = totalLost;

    let enemyUnits = roundResult.killed[ENEMY_SIDE];
    totalLost = 0;

    traverseGroup(enemyUnits, function(armyName, typeName, unitName, count) {
      increment[`reptiles.killed.${armyName}.${typeName}.${unitName}`] = count;
      totalLost += count;
    });

    increment['reptiles.killed.total'] = totalLost;

    Game.Statistic.incrementUser(Meteor.userId(), increment);
  }

  saveMultiUsersStatistic(roundResult) {
    let increment = {};
    let userNames = _.keys(this.currentUnits[USER_SIDE]);

    console.log('multiUsers', increment);
    //todo Game.Statistic.incrementGroupUserNames(userNames, increment);
  }

  finishBattle(userArmyRest, enemyArmyRest, options) {
    this.status = Status.finish;

    if (options.isOnlyDamage) {
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

    if (!options.isEarth) {
      this.giveReward(userArmyRest, enemyArmyRest, options);
      this.saveBattleStatistic(this.result, options);
    }

    this.update({
      $set: {
        status: this.status
      }
    });
  }

  giveReward(userArmyRest, enemyArmyRest, options) {
    this.rewards = {};
    this.cards = null;

    if (!userArmyRest || enemyArmyRest) {
      return;
    }

    let totalReward = {};
    let mission = Game.Battle.items[ options.missionType ].level[ options.missionLevel ];

    if (mission.reward) {
      totalReward.metals = mission.reward.metals;
      totalReward.crystals = mission.reward.crystals;
    } else {
      let killedArmy = this.calculateTotalKilled(ENEMY_SIDE);
      let killedCost = Game.Unit.calculateArmyCost(killedArmy);

      totalReward.metals = Math.floor( killedCost.metals * 0.1 );
      totalReward.crystals = Math.floor( killedCost.crystals * 0.1 );
    }

    let armyPowers = this.armyPowers;
    let totalPower = calculateTotalPower(armyPowers);

    let dividedReward = {
      metals: totalReward.metals / totalPower,
      crystals: totalReward.crystals / totalPower
    };

    for (let username in armyPowers) {
      if (armyPowers.hasOwnProperty(username)) {
        let groupPower = armyPowers[username];

        let reward = {
          metals: Math.floor(dividedReward.metals * groupPower),
          crystals: Math.floor(dividedReward.crystals * groupPower)
        };

        let user = Meteor.users.findOne({username});
        Game.Resources.add(reward, user._id);

        this.rewards[username] = reward;
      }
    }

    let names = _.keys(armyPowers);

    if (options.artefacts) {
      let artefacts = [];
      for (let artefactName in options.artefacts) {
        if (options.artefacts.hasOwnProperty(artefactName)) {
          let count = options.artefacts[artefactName];
          _.times(count, () => artefacts.push(artefactName));
        }
      }

      for (let artefactName of artefacts) {
        let username = names[Game.Random.interval(0, names.length - 1)];
        let user = Meteor.users.findOne({username});

        Game.Resources.add({[artefactName]: 1}, user._id);
      }
    }

    if (mission.cards) {
      let missionCards = mission.cards;
      for (let cardName in missionCards) {
        if (missionCards.hasOwnProperty(cardName)) {
          if (Game.Random.chance( missionCards[cardName] )) {
            let username = names[Game.Random.interval(0, names.length - 1)];
            let user = Meteor.users.findOne({username});

            Game.Cards.add({[cardName]: 1}, user._id);
          }
        }
      }
      this.cards = missionCards;
    }
  }

  saveBattleStatistic(result, options) {
    let userNames = _.keys(this.currentUnits[USER_SIDE]);

    let fieldName = (userNames.length === 1) ? 'battle' : 'multiUsersBattle';

    let increment = {};

    increment[`${fieldName}.total`] = 1;

    let resultName = Game.Battle.resultNames[result];
    increment[`${fieldName}.${resultName}`] = 1;

    if (options.missionType && options.missionLevel) {
      increment[`${fieldName}.${options.missionType}.total`] = 1;
      increment[`${fieldName}.${options.missionType}.${options.missionLevel}.total`] = 1;

      increment[`${fieldName}.${options.missionType}.${resultName}`] = 1;
      increment[`${fieldName}.${options.missionType}.${options.missionLevel}.${resultName}`] = 1;
    }

    Game.Statistic.incrementGroupUserNames(userNames, increment);
  }

  calculateTotalKilled(sideName) {
    let initialUnits = this.initialUnits;
    let result = {};

    traverseSide(this.currentUnits, sideName, function(username, groupNum, group) {
      traverseGroup(group, function(armyName, typeName, unitName, unit) {
        let diff = initialUnits[sideName][username][groupNum][armyName][typeName][unitName].count - unit.count;

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
          unitName
        });
      });
    });
  }
}

Battle.Status = Status;
Battle.USER_SIDE = USER_SIDE;
Battle.ENEMY_SIDE = ENEMY_SIDE;

let calculateTotalPower = function(armyPowers) {
  let totalPower = 0;

  for (let username in armyPowers) {
    if (armyPowers.hasOwnProperty(username)) {
      totalPower += armyPowers[username];
    }
  }

  return totalPower;
};

let traverseUnits = function(units, callback) {
  for (let sideName in units) {
    if (!units.hasOwnProperty(sideName)) {
      continue;
    }

    traverseSide(units, sideName, function(username, groupNum, group) {
      callback(sideName, username, groupNum, group);
    });
  }
};

let traverseSide = function(units, sideName, callback) {
  let side = units[sideName];

  for (let username in side) {
    if (!side.hasOwnProperty(username)) {
      continue;
    }
    let groups = side[username];

    for (let groupNum = 0; groupNum < groups.length; groupNum++) {
      let group = groups[groupNum];

      callback(username, groupNum, group);
    }
  }
};

let getPoints = function(resources) {
  let points = 0;
  for (let res in resources) {
    if (resources.hasOwnProperty(res)) {
      if (res !== 'time') {
        points += resources[res] * (res === 'crystals' ? 3 : res === 'humans' ? 4 : 1);
      }
    }
  }
  return points;
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

export default Battle;
