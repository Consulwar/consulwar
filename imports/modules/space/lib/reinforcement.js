import { Meteor } from 'meteor/meteor';
import { spaceEvents } from './events';

export const EVENT_TYPE = 'reinforcement';

export function getReinforcements() {
  return spaceEvents.find({
    'data.userId': Meteor.userId(),
    type: EVENT_TYPE,
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
}
