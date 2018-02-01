import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import datadog from '/imports/modules/Log/server/datadog';
import { Job } from '/moduls/game/lib/jobs';
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
  //Space.jobs.setLogStream(process.stdout);

  if (datadog.gauge && Meteor.settings.last) {
    const job = new Job(Space.jobs, 'datadog', {});
    job
      .repeat({
        wait: 1000,
      })
      .save();

    Space.jobs.processJobs(
      'datadog',
      {
        concurrency: Config.JOBS.concurrency,
        payload: Config.JOBS.payload,
        pollInterval: Config.JOBS.pollInterval,
        prefetch: Config.JOBS.prefetch,
      },
      (spaceJob, cb) => {
        datadog.gauge(
          'jobs.ready',
          Space.collection.find({ status: 'ready' }).count(),
        );

        datadog.gauge(
          'jobs.failed',
          Space.collection.find({ status: 'failed' }).count(),
        );

        datadog.gauge(
          'jobs.waiting',
          Space.collection.find({ status: 'waiting' }).count(),
        );

        spaceJob.done();
        cb();
      },
    );
  }

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
