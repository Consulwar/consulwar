import Space from '../../lib/space';
import Lib from '../../lib/flightEvents';
import Config from '../config';

import humansArrival from '../flightHumansArrival';
import reptileArrival from '../flightReptileArrival';

export default Space.jobs.processJobs(
  Lib.EVENT_TYPE,
  {
    concurrency: Config.JOBS.concurrency,
    payload: Config.JOBS.payload,
    pollInterval: Config.JOBS.pollInterval,
    prefetch: Config.JOBS.prefetch,
  },
  (job, cb) => {
    const { data } = job;

    if (data.isHumans) {
      humansArrival(data);
    } else {
      reptileArrival(data);
    }

    job.done();
    cb();
  },
);
