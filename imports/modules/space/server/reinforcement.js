import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import { spaceEvents } from '../lib/events';
import { EVENT_TYPE } from '../lib/reinforcement';
import { Job } from '../lib/jobs';

export default class Reinforcement {
  static add(data) {
    const job = new Job(spaceEvents, EVENT_TYPE, data);
    job.delay(Game.Earth.REINFORCEMENTS_DELAY * 1000)
      .save();
  }
}

spaceEvents.processJobs(
  EVENT_TYPE,
  {
    concurrency: 4,
    payload: 1,
    pollInterval: 100,
    prefetch: 1,
  },
  (job, cb) => {
    const { units, protectAllHonor, targetZoneName, user_id } = job.data;

    // kill random count on the way
    let killedPercent = 0;
    let k = 1;

    if (!protectAllHonor) {
      killedPercent = Game.Random.interval(0, 30);
      k = 1 - (killedPercent / 100);
    }

    job.done({ killedPercent });

    let arrived = null;

    _(units).pairs().forEach(([sideName, side]) => {
      _(side).pairs().forEach(([groupName, group]) => {
        _(group).pairs().forEach(([unitName, countStr]) => {
          const count = parseInt(countStr, 10);

          let result = Math.floor(count * k);
          if (Game.Random.random() < (count * k) % 1) {
            result += 1;
          }
          // save result
          if (result > 0) {
            if (!arrived) {
              arrived = {};
            }
            if (!arrived[sideName]) {
              arrived[sideName] = {};
            }
            if (!arrived[sideName][groupName]) {
              arrived[sideName][groupName] = {};
            }
            arrived[sideName][groupName][unitName] = result;
          }
        });
      });
    });

    // save reinforcements
    if (arrived) {
      const user = Meteor.users.findOne({ _id: user_id });
      Game.Earth.addReinforcement(arrived, targetZoneName, user);
    }

    cb();
  },
);
