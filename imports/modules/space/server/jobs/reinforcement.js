import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import Space from '../../lib/space';
import Lib from '../../lib/reinforcement';
import Config from '../config';

export default Space.jobs.processJobs(
  Lib.EVENT_TYPE,
  {
    concurrency: Config.JOBS.concurrency,
    payload: Config.JOBS.payload,
    pollInterval: Config.JOBS.pollInterval,
    prefetch: Config.JOBS.prefetch,
  },
  (job, cb) => {
    const { units, protectAllHonor, targetZoneName, userId } = job.data;

    // kill random count on the way
    let killedPercent = 0;
    let k = 1;

    if (!protectAllHonor) {
      killedPercent = Game.Random.interval(0, 30);
      k = 1 - (killedPercent / 100);
    }

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
      const user = Meteor.users.findOne({ _id: userId });
      Game.Earth.addReinforcement(arrived, targetZoneName, user);
    }

    job.done({ killedPercent });
    cb();
  },
);
