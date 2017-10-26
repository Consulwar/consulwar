import { Job } from '/moduls/game/lib/jobs';

import Space from '../lib/space';
import Lib from '../lib/battle';
import battleDelay from './battleDelay';
import Config from './config';

export default {
  add({ userArmy, enemyArmy, data }) {
    const job = new Job(Space.jobs, Lib.EVENT_TYPE, data);
    job
      .retry(Config.JOBS.retries)
      .delay(battleDelay({ userArmy, enemyArmy }))
      .save();
  },

  findByPlanetId(planetId) {
    return Space.collection.findOne({
      type: Lib.EVENT_TYPE,
      'data.planetId': planetId,
      status: { $ne: 'completed' },
    });
  },

  findByFleetId(fleetId) {
    return Space.collection.findOne({
      type: Lib.EVENT_TYPE,
      'data.fleetId': fleetId,
      status: { $ne: 'completed' },
    });
  },
};
