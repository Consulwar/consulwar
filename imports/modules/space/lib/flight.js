import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import Space from './space';

const EVENT_TYPE = 'flight';

const Target = {
  SHIP: 1,
  PLANET: 2,
  BATTLE: 3,
};

const getFleets = function() {
  return Space.collection.find({
    type: EVENT_TYPE,
    'data.userId': Meteor.userId(),
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
};

const getFleetUnits = function(data) {
  if (data.mission) {
    if (data.mission.units) {
      return data.mission.units;
    }

    return _.clone(Game.Battle.items[data.mission.type].level[data.mission.level].enemies);
  } else if (data.armyId) {
    const army = Game.Unit.getArmy(data.armyId, data.userId);
    if (army && army.units && army.units.army) {
      return army.units.army.fleet;
    }
  }

  return null;
};

const getOneByUserId = function(_id, userId = Meteor.userId()) {
  return Space.collection.findOne({
    'data.userId': userId,
    _id,
    status: { $ne: 'completed' },
  });
};

export default {
  EVENT_TYPE,
  Target,
  getFleets,
  getFleetUnits,
  getOneByUserId,
};
