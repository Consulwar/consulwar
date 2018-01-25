import { Meteor } from 'meteor/meteor';
import Space from './space';

const EVENT_TYPE = 'reinforcement';

const getAllByUserId = function(userId = Meteor.userId()) {
  return Space.collection.find({
    'data.userId': userId,
    type: EVENT_TYPE,
    status: Space.filterActive,
  }, {
    sort: {
      after: 1,
    },
  });
};

const getCurrentCountByUserId = function(userId = Meteor.userId()) {
  return Space.collection.find({
    'data.userId': userId,
    type: EVENT_TYPE,
    status: Space.filterActive,
  }).count();
};

const canSendReinforcement = function(userId = Meteor.userId()) {
  return getCurrentCountByUserId(userId) < 1;
};

export default {
  EVENT_TYPE,
  getAllByUserId,
  canSendReinforcement,
};
