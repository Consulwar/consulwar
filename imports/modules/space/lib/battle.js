import { Meteor } from 'meteor/meteor';
import Space from './space';

const EVENT_TYPE = 'battle';

function getAllByUserId(userId = Meteor.userId()) {
  return Space.collection.find({
    type: EVENT_TYPE,
    'data.userId': userId,
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
}

function findByBattleId(battleId) {
  return Space.collection.findOne({
    type: EVENT_TYPE,
    'data.battleId': battleId,
    status: { $ne: 'completed' },
  });
}

export default {
  EVENT_TYPE,
  getAllByUserId,
  findByBattleId,
};
