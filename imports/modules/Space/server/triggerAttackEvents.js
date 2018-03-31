import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Config from './config';
import Lib from '../lib/triggerAttack';

export default {
  add(data) {
    const oldJobs = Space.jobs.find({ type: Lib.EVENT_TYPE, data, status: { $nin: ['completed', 'cancelled'] } });
    if (!oldJobs.count())
    {
      const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);
      job
        .retry({
          retries: Config.JOBS.retry.retries,
          wait: Config.JOBS.retry.wait,
        })
        .delay(Config.TRIGGER_ATTACK_DELAY * 1000)
        .save();
    }
  },
};
