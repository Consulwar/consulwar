import { Meteor } from 'meteor/meteor';
import { spaceEvents } from './events';

export const EVENT_TYPE = 'battle';

export function getBattles() {
  return spaceEvents.find({
    type: EVENT_TYPE,
    'data.user_id': Meteor.userId(),
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
}

export function findByBattleId(battleId) {
  return spaceEvents.findOne({
    type: EVENT_TYPE,
    'data.user_id': Meteor.userId(),
    'data.battleId': battleId,
    status: { $ne: 'completed' },
  });
}
