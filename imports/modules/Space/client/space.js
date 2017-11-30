import { Meteor } from 'meteor/meteor';
import Lib from '../lib/space';

const getAllByUserId = function(userId = Meteor.userId()) {
  return Lib.collection.find({
    'data.userId': userId,
  }, {
    sort: {
      after: 1,
    },
  });
};

const getAllByUserIdAndUsername = function(username, user = Meteor.user) {
  return Lib.collection.find({
    'data.username': { $in: [user.username, username] },
  }, {
    sort: {
      after: 1,
    },
  });
};

export default {
  ...Lib,
  getAllByUserId,
  getAllByUserIdAndUsername,
};
