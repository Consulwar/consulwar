import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { JobCollection } from '/moduls/game/lib/jobs';
import Config from './config';

const jobs = new JobCollection('spaceEvents');
const collection = jobs; // для более внятного использования
const filterActive = { $nin: ['completed', 'cancelled'] };

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

const canMoveFromSpaceToHangar = function(user = Meteor.user()) {
  const date = new Date();
  return (
    !user.lastMoveToHangar ||
    user.lastMoveToHangar < (date - Config.FROM_SPACE_TO_HANGAR_PERIOD)
  );
};

export default {
  jobs,
  collection,
  filterActive,
  getMaxFleetCount,
  canSendFleet,
  canMoveFromSpaceToHangar,
};
