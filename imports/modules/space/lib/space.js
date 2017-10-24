import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { JobCollection } from '/moduls/game/lib/jobs';

const jobs = new JobCollection('spaceEvents');
const collection = jobs; // для более внятного использования

const getCurrentFleetsCount = function (userId = Meteor.userId()) {
  return Game.Unit.Collection.find({
    user_id: userId,
    location: { $ne: Game.Unit.location.HOME },
  }).count();
};

function canSendFleet(userId = Meteor.userId()) {
  return getCurrentFleetsCount(userId) < Game.Planets.getMaxColoniesCount();
}

function getAllByUserId(userId = Meteor.userId()) {
  return collection.find({
    'data.userId': userId,
  }, {
    sort: {
      after: 1,
    },
  });
}

export default {
  jobs,
  collection,
  canSendFleet,
  getAllByUserId,
};
