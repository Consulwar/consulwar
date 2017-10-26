import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Config from './config';
import Lib from '../lib/triggerAttack';

export default {
  add(data, delay, userId) {
    const savedData = {
      ...data,
      userId,
    };

    const job = new Job(Space.jobs, Lib.EVENT_TYPE, savedData);
    job
      .retry({
        retries: Config.JOBS.retry.retries,
        wait: Config.JOBS.retry.wait,
      })
      .delay(delay * 1000)
      .save();
  },
};
