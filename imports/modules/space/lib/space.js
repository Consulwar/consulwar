import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { JobCollection } from '/moduls/game/lib/jobs';

const jobs = new JobCollection('spaceEvents');
const collection = jobs; // для более внятного использования

const getCurrentFleetsCount = function(userId = Meteor.userId()) {
  return Game.Unit.Collection.find({
    user_id: userId,
    location: { $ne: Game.Unit.location.HOME },
  }).count();
};

const getMaxFleetCount = function() {
  return Game.Planets.getMaxColoniesCount() * 2;
};

const canSendFleet = function(userId = Meteor.userId()) {
  return getCurrentFleetsCount(userId) < getMaxFleetCount();
};

export default {
  jobs,
  collection,
  getMaxFleetCount,
  canSendFleet,
};
