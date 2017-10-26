import { Meteor } from 'meteor/meteor';
import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Lib from '../lib/flight';
import Config from './config';

const { EVENT_TYPE, TARGET } = Lib;

const add = function(data, targetType, userId) {
  const savedData = {
    ...data,
    targetType,
    userId,
  };

  const job = new Job(Space.jobs, EVENT_TYPE, savedData);
  job
    .retry(Config.JOBS.retries)
    .delay(data.flyTime * 1000)
    .save();
};

export default {
  ...Lib,

  toPlanet(data, userId = Meteor.userId()) {
    add(data, TARGET.PLANET, userId);
  },

  toShip(data, userId = Meteor.userId()) {
    add(data, TARGET.SHIP, userId);
  },

  toBattle(data, userId = Meteor.userId()) {
    add(data, TARGET.BATTLE, userId);
  },
};
