import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import datadog from '/imports/modules/Log/server/datadog';
import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Config from './config';
import './methods';
import FlightQueue from './jobs/flight';
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

Space.collection._ensureIndex({
  type: 1,
  'data.targetPlanet': 1,
  status: 1,
});

Meteor.publish('mySpaceEvents', function() {
  if (Config.DISABLE_MERGEBOX) {
    this.disableMergebox();
  }

  if (this.userId) {
    return Space.collection.find({
      'data.userId': this.userId,
      status: Space.filterActive,
    });
  }
  return null;
});

Meteor.publish('spaceEvents', function(hex) {
  if (Config.DISABLE_MERGEBOX) {
    this.disableMergebox();
  }

  check(hex, Object);

  if (this.userId) {
    return Space.collection.find({
      $or: [
        { 'data.hex': hex },
        { 'data.targetHex': hex },
      ],
      status: Space.filterActive,
    }, {
      fields: {
        type: 1,
        data: 1,
        status: 1,
        created: 1,
        repeated: 1,
        after: 1,
      },
    });
  }
  return null;
});

export default function initSpaceServer() {
  Space.jobs.promote(Config.JOBS.promote);
  Space.jobs.startJobServer();

  Error.stackTraceLimit = 1000;
  process.on('SIGINT', function() {
    let i = 0;

    const done = function() {
      i += 1;
      if (i >= 3) {
        process.exit(0);
      }
    };

    FlightQueue.shutdown({ level: 'soft' }, done);
    BattleQueue.shutdown({ level: 'soft' }, done);
    TriggerAttackQueue.shutdown({ level: 'soft' }, done);
  });
}
