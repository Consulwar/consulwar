import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { spaceEvents } from './events';

export const EVENT_TYPE = 'flight';

export const Target = {
  SHIP: 1,
  PLANET: 2,
  BATTLE: 3,
};

export function getFleets() {
  return spaceEvents.find({
    type: EVENT_TYPE,
    'data.userId': Meteor.userId(),
    status: { $ne: 'completed' },
  }, {
    sort: {
      after: 1,
    },
  });
}

export function getFleetUnits(data) {
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
}

export function getOne(_id, userId = Meteor.userId()) {
  return spaceEvents.findOne({
    'data.userId': userId,
    _id,
    status: { $ne: 'completed' },
  });
}
