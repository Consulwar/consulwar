import { Meteor } from 'meteor/meteor';
import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import humansFlight from './flight/humansFlight';
import reptileFlight from './flight/reptileFlight';
import Lib from '../lib/flight';
import Config from './config';

const { EVENT_TYPE, Target } = Lib;

function add(data, userId) {
  const savedData = {
    ...data,
    userId,
  };

  const job = new Job(Space.jobs, EVENT_TYPE, savedData);
  job
    .retry(Config.JOBS.retries)
    .delay(data.flyTime * 1000)
    .save();
}

const queue = Space.jobs.processJobs(
  EVENT_TYPE,
  {
    concurrency: Config.JOBS.concurrency,
    payload: Config.JOBS.payload,
    pollInterval: Config.JOBS.pollInterval,
    prefetch: Config.JOBS.prefetch,
  },
  (job, cb) => {
    const data = job.data;

    if (data.isHumans) {
      humansFlight(data);
    } else {
      reptileFlight(data);
    }

    job.done();
    cb();
  },
);

export default {
  ...Lib,

  toPlanet(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.PLANET,
    }, userId);
  },

  toShip(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.SHIP,
    }, userId);
  },

  toBattle(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.BATTLE,
    }, userId);
  },

  queue,
};
