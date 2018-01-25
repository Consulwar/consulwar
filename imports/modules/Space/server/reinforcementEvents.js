import { Job } from '/moduls/game/lib/jobs';
import Game from '/moduls/game/lib/main.game';
import Space from '../lib/space';
import Lib from '../lib/reinforcement';
import Config from './config';

export default {
  ...Lib,

  add(data) {
    const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);
    job
      .retry({
        retries: Config.JOBS.retry.retries,
        wait: Config.JOBS.retry.wait,
      })
      .delay(Game.Earth.REINFORCEMENTS_DELAY * 1000)
      .save();
  },
};
