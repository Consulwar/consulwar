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

export function findByBattleId(battleID) {
  return spaceEvents.findOne({
    type: EVENT_TYPE,
    'data.user_id': Meteor.userId(),
    'data.battleID': battleID,
    status: { $ne: 'completed' },
  });
}
