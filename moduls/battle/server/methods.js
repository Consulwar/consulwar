import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import BattleCollection from '../lib/imports/collection';
import Battle from '/moduls/battle/lib/imports/battle';

const restructureUnits = function (battle, side, userList) {
  const result = {};
  userList.forEach((userName) => {
    const userResult = {
      power: battle.armyPowers[userName],
      groups: [],
    };
    battle.initialUnits[side][userName].forEach((group, groupKey) => {
      const groupResult = {};
      Object.entries(group).forEach(([unitId, unit]) => {
        const unitResult = {
          initial: unit.count,
          current: battle.currentUnits[side][userName][groupKey][unitId].count,
        };
        groupResult[unitId] = unitResult;
      });
      userResult.groups.push(groupResult);
    });
    result[userName] = userResult;
  });
  return result;
}

// TODO Convert battle data to convenient format on battle write to DB
const sanitizeBattle = function(battle) {
  const result = {
    result: battle.result,
    round: battle.round,
    status: battle.status,
    options: battle.options,
    timeStart: battle.timeStart,
    lostResources: battle.lostResources,
    reward: battle.reward,
    sides: {
      [Battle.USER_SIDE]: restructureUnits(battle, Battle.USER_SIDE, battle.userNames),
      [Battle.ENEMY_SIDE]: restructureUnits(battle, Battle.ENEMY_SIDE, [Battle.aiName]),
    },
    isBattle1x1: Battle.isBattle1x1(battle),
  };
  return result;
}

Meteor.methods({
  'battle.getPage'(page, count, isEarth) {
    check(page, Match.Integer);
    check(count, Match.Integer);
    check(isEarth, Boolean);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battle.getPage', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    const cursor = BattleCollection.find({
      userNames: user.username,
      'options.isEarth': (isEarth ? true : null),
    }, {
      transform: sanitizeBattle,
      sort: { timeStart: -1 },
      skip: (page > 0) ? (page - 1) * count : 0,
      limit: count,
    });
    return { battles: cursor.fetch(), totalCount: cursor.count() };
  },

  'battle.getById'(id) {
    check(id, String);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battle.getById', user });

    return BattleCollection.findOne({
      _id: id,
    });
  },
});
