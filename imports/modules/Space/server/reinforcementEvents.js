import { Job } from '/moduls/game/lib/jobs';
import Game from '/moduls/game/lib/main.game';
import Space from '../lib/space';
import Lib from '../lib/reinforcement';
import Config from './config';

export default {
  ...Lib,

  add(data) {
    const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);

    let power = 1;
    switch (Game.User.getLevel(data.rating)) {
      case 0:
        power = 10;
        break;
      case 1:
        power = 8;
        break;
      case 2:
        power = 5;
        break;
      case 3:
        power = 2;
        break;
      default:
        power = 1;
        break;
    }

    let time = Game.Earth.REINFORCEMENTS_DELAY * 1000;
    time /= power;

    job
      .retry({
        retries: Config.JOBS.retry.retries,
        wait: Config.JOBS.retry.wait,
      })
      .delay(Math.round(time))
      .save();
  },
};
