import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import Log from '/imports/modules/Log/server/Log';
import Space from '../lib/space';
import Config from './config';
import './methods';
import FlightQueue from './jobs/flight';
import BattleQueue from './jobs/battle';
import TriggerAttackQueue from './jobs/triggerAttack';
import './aiFleets';
import './krampussy';

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

Meteor.publish('globalSpaceEvents', function() {
  if (Config.DISABLE_MERGEBOX) {
    this.disableMergebox();
  }

  if (this.userId) {
    return Space.collection.find({
      $or: [
        { 'data.global': true },
        { 'data.mission.type': 'prisoners' },
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

Meteor.publish('spaceEvents', function(hex) {
  const ts = Date.now();
  if (Config.DISABLE_MERGEBOX) {
    this.disableMergebox();
  }

  check(hex, Object);

  if (this.userId) {
    const subsCount = Object.values(this._session._namedSubs)
      .reduce((sum, x) => sum += x._name === this._name ? 1 : 0, 0);
    if (subsCount > Meteor.settings.ddplimiter.spaceSubscriptions) {
      throw new Meteor.Error('Уже открыто слишком много галактик');
    }

    const result = Space.collection.find({
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
    Log.add({ name: 'subscribe.spaceEvents', info: `${Meteor.user().username} => [${hex.x}, ${hex.z}] (${Date.now() - ts})` });
    return result;
  }
  return null;
});

export default function initSpaceServer() {
  Space.jobs.promote(Config.JOBS.promote);
  Space.jobs.startJobServer();

  Error.stackTraceLimit = 1000;
  const bound = Meteor.bindEnvironment((callback) => { callback(); });
  process.on('SIGINT', () => {
    bound(function() {
      let i = 0;

      const done = function() {
        i += 1;
        if (i >= 3) {
          console.log(`Process ${process.pid} exiting normally`);
          process.exit(0);
        }
      };

      FlightQueue.shutdown({ level: 'soft' }, done);
      BattleQueue.shutdown({ level: 'soft' }, done);
      TriggerAttackQueue.shutdown({ level: 'soft' }, done);
    });
  });
}
