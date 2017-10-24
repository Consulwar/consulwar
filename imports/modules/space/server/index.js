import { Meteor } from 'meteor/meteor';
import Space from '../lib/space';
import Config from './config';
import './methods';
import Flight from './flight';
import Reinforcement from './reinforcement';
import Battle from './battle';
import TriggerAttack from './triggerAttack';

Space.collection._ensureIndex({
  'data.userId': 1,
  'data.planetId': 1,
  status: 1,
});

Meteor.publish('spaceEvents', function () {
  if (this.userId) {
    return Space.collection.find({
      'data.userId': this.userId,
      status: { $ne: 'completed' },
    });
  }
  return null;
});

export default function initSpaceServer() {
  Space.jobs.promote(Config.JOBS.promote);

  Space.jobs.startJobServer();

  process.on('SIGINT', function() {
    let i = 0;

    function done() {
      i += 1;
      if (i >= 4) {
        process.exit(0);
      }
    }

    Flight.queue.shutdown({ level: 'soft' }, done);
    Reinforcement.queue.shutdown({ level: 'soft' }, done);
    Battle.queue.shutdown({ level: 'soft' }, done);
    TriggerAttack.queue.shutdown({ level: 'soft' }, done);
  });
}
