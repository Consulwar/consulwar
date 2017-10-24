import { Meteor } from 'meteor/meteor';
import Space from './space';

const EVENT_TYPE = 'reinforcement';

function getAllByUserId(userId = Meteor.userId()) {
  return Space.collection.find({
    'data.userId': userId,
    type: EVENT_TYPE,
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
}

export default {
  EVENT_TYPE,
  getAllByUserId,
};
