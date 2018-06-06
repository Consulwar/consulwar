import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import Space from './space';

const EVENT_TYPE = 'flight';

const TARGET = {
  SHIP: 1,
  PLANET: 2,
  BATTLE: 3,
};

const getFleetsEvents = function() {
  return Space.collection.find({
    type: EVENT_TYPE,
    'data.userId': Meteor.userId(),
    status: Space.filterActive,
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
    const army = Game.Unit.getArmy({ id: data.armyId });
    if (army && army.units) {
      return _.pickBy(army.units, (unit, id) => id.indexOf('/Space/') !== -1) || null;
    }
  }

  return null;
};

const getOne = function(_id) {
  return Space.collection.findOne({
    type: EVENT_TYPE,
    _id,
    status: Space.filterActive,
  });
};

export default {
  EVENT_TYPE,
  TARGET,
  getFleetsEvents,
  getFleetUnits,
  getOne,
};
