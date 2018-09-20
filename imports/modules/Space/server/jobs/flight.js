import { Meteor } from 'meteor/meteor';
import Space from '../../lib/space';
import Lib from '../../lib/flightEvents';
import Config from '../config';

import humansArrival from '../flightHumansArrival';
import reptileArrival from '../flightReptileArrival';

if (Meteor.settings.space.jobs.enabled) {
  export default Space.jobs.processJobs(
    Lib.EVENT_TYPE,
    {
      concurrency: Config.JOBS.concurrency,
      payload: Config.JOBS.payload,
      pollInterval: Config.JOBS.pollInterval,
      prefetch: Config.JOBS.prefetch,
      workTimeout: Config.JOBS.workTimeout,
    },
    (job, cb) => {
      try {
        const { data } = job;

        if (data.isHumans) {
          humansArrival(data);
        } else {
          reptileArrival(data);
        }

        job.done();
        cb();
      } catch (err) {
        job.fail(err.stack);
        cb(err.stack);
      }
    },
  );
}
