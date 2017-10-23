import { Meteor } from 'meteor/meteor';
import { spaceEvents } from '../lib/events';
import humansFlight from './flight/humansFlight';
import reptileFlight from './flight/reptileFlight';
import { Job } from '../lib/jobs';

import { EVENT_TYPE, Target } from '../lib/flight';

function add(data, userId) {
  const savedData = {
    ...data,
    userId,
  };

  const job = new Job(spaceEvents, EVENT_TYPE, savedData);
  job.delay(data.flyTime * 1000)
    .save();
}

export default class Flight {
  static toPlanet(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.PLANET,
    }, userId);
  }

  static toShip(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.SHIP,
    }, userId);
  }

  static toBattle(data, userId = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.BATTLE,
    }, userId);
  }
}

spaceEvents.processJobs(EVENT_TYPE, (job, cb) => {
  job.done();

  const data = job.data;

  if (data.isHumans) {
    humansFlight(data);
  } else {
    reptileFlight(data);
  }

  cb();
});
