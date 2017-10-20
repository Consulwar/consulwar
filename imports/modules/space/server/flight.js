import { Meteor } from 'meteor/meteor';
import { spaceEvents } from '../lib/events';
import humansFlight from './flight/humansFlight';
import reptileFlight from './flight/reptileFlight';
import { Job } from '../lib/jobs';

import { EVENT_TYPE, Target } from '../lib/flight';

function add(data, user_id) {
  const savedData = {
    ...data,
    user_id,
  };

  const job = new Job(spaceEvents, EVENT_TYPE, savedData);
  job.delay(data.flyTime * 1000)
    .save();
}

export default class Flight {
  static toPlanet(data, user_id = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.PLANET,
    }, user_id);
  }

  static toShip(data, user_id = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.SHIP,
    }, user_id);
  }

  static toBattle(data, user_id = Meteor.userId()) {
    add({
      ...data,
      targetType: Target.BATTLE,
    }, user_id);
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
