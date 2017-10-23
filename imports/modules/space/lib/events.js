import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { JobCollection } from './jobs';

export const spaceEvents = new JobCollection('spaceEvents');

if (Meteor.isServer) {
  spaceEvents._ensureIndex({
    'data.userId': 1,
    'data.planetId': 1,
    status: 1,
  });

  spaceEvents.promote(500);

  Meteor.publish('spaceEvents', function () {
    if (this.userId) {
      return spaceEvents.find({
        'data.userId': this.userId,
        status: { $ne: 'completed' },
      });
    }
    return null;
  });
}

const getCurrentFleetsCount = function () {
  return spaceEvents.find({
    'data.userId': Meteor.userId(),
    status: { $ne: 'completed' },
  }).count();
};

export function canSendFleet() {
  return getCurrentFleetsCount() < Game.Planets.getMaxColoniesCount();
}

export function getAll() {
  return spaceEvents.find({
    'data.userId': Meteor.userId(),
  }, {
    sort: {
      after: 1,
    },
  });
}
