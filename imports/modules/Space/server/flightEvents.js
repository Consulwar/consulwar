import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Lib from '../lib/flightEvents';
import Config from './config';

const add = function(data) {
  const savedData = { ...data };

  if (!data.returnDestination) {
    savedData.returnDestination = data.startPosition;
    savedData.returnPlanetId = data.startPlanetId;
  }

  const job = new Job(Space.jobs, Lib.EVENT_TYPE, savedData);
  job
    .retry(Config.JOBS.retries)
    .delay(data.flyTime * 1000)
    .save();
};

const flyBack = function(data) {
  add({
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: data.targetPosition,
    targetPosition: data.returnDestination,
    targetId: data.returnPlanetId,
    targetType: Lib.TARGET.PLANET,
    targetHex: data.hex,
    hex: data.targetHex,
  });
};

export default {
  ...Lib,
  add,
  flyBack,
};
