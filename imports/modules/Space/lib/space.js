import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import { JobCollection } from '/moduls/game/lib/jobs';
import BattleCollection from '/moduls/battle/lib/imports/collection';
import Battle from '/moduls/battle/lib/imports/battle';
import Config from './config';

const jobs = new JobCollection('spaceEvents');
const collection = jobs; // для более внятного использования
const filterActive = { $nin: ['completed', 'cancelled'] };

const getCurrentArmyCount = function(userId = Meteor.userId()) {
  const battleCount = BattleCollection.find({
    status: Battle.Status.progress,
    userNames: Meteor.users.findOne({ _id: userId }).username,
  }).count();

  const unitCount = Game.Unit.Collection.find({
    user_id: userId,
    location: { $ne: Game.Unit.location.HOME },
  }).count();

  return battleCount + unitCount;
};

const getMaxArmyCount = function() {
  return Game.Planets.getMaxColoniesCount() * 2;
};

const canCreateArmy = function(userId = Meteor.userId()) {
  return getCurrentArmyCount(userId) < getMaxArmyCount();
};

const checkSendFleet = function({ planet, units, userId = Meteor.userId() }) {
  let needSliceArmy = true;

  if (!planet.isHome && units) {
    // test selected units vs available units
    const baseUnits = Game.Planets.getFleetUnits(planet._id, userId);
    if (!baseUnits) {
      throw new Error('Какая-то херня произошла с юнитами на планете', 'их нет');
    }
    needSliceArmy = _(baseUnits)
      .pairs()
      .some(([name, count]) => count > 0 && (!units[name] || count > units[name]));
  }

  const canSend = !needSliceArmy || canCreateArmy(userId);

  return {
    canSend,
    needSliceArmy,
  };
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
  getCurrentArmyCount,
  getMaxArmyCount,
  canCreateArmy,
  checkSendFleet,
  canMoveFromSpaceToHangar,
};
