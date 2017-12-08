import { Meteor } from 'meteor/meteor';
import Space from '../lib/space';
import Config from './config';
import './methods';
import FlightQueue from './jobs/flight';
import ReinforcementQueue from './jobs/reinforcement';
import BattleQueue from './jobs/battle';
import TriggerAttackQueue from './jobs/triggerAttack';

Space.collection._ensureIndex({
  'data.userId': 1,
  status: 1,
});

Space.collection._ensureIndex({
  type: 1,
  'data.userId': 1,
  status: 1,
});

Space.collection._ensureIndex({
  type: 1,
  'data.userId': 1,
  status: 1,
  after: 1,
});

Space.collection._ensureIndex({
  type: 1,
  'data.planetId': 1,
  status: 1,
});

Space.collection._ensureIndex({
  type: 1,
  'data.battleId': 1,
  status: 1,
});

Space.collection._ensureIndex({
  type: 1,
  'data.fleetId': 1,
  status: 1,
});

Meteor.publish('mySpaceEvents', function() {
  if (this.userId) {
    return Space.collection.find({
      'data.userId': this.userId,
      status: Space.filterActive,
    });
  }
  return null;
});

Meteor.publish('spaceEvents', function(hexes) {
  if (this.userId) {
    return Space.collection.find({
      $or: [
        { 'data.hex': { $in: hexes } },
        { 'data.targetHex': { $in: hexes } },
      ],
      status: Space.filterActive,
    });
  }
  return null;
});

export default function initSpaceServer() {
  Space.jobs.promote(Config.JOBS.promote);

  Space.jobs.startJobServer();

  process.on('SIGINT', function() {
    let i = 0;

    const done = function() {
      i += 1;
      if (i >= 4) {
        process.exit(0);
      }
    };

    FlightQueue.shutdown({ level: 'soft' }, done);
    ReinforcementQueue.shutdown({ level: 'soft' }, done);
    BattleQueue.shutdown({ level: 'soft' }, done);
    TriggerAttackQueue.shutdown({ level: 'soft' }, done);
  });
}
