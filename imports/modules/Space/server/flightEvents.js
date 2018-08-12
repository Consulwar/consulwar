import { Job } from '/moduls/game/lib/jobs';
import Space from '../lib/space';
import Lib from '../lib/flightEvents';
import Config from './config';
import Hex from '../../MutualSpace/lib/Hex';
import Utils from '../lib/utils';

const add = function(data, delayOverride) {
  const savedData = { ...data };

  if (!data.returnDestination) {
    savedData.returnDestination = data.startPosition;
    savedData.returnPlanetId = data.startPlanetId;
  }

  const job = new Job(Space.jobs, Lib.EVENT_TYPE, savedData);
  job
    .retry({
      retries: Config.JOBS.retry.retries,
      wait: Config.JOBS.retry.wait,
    })
    .delay(delayOverride !== undefined ? delayOverride : data.flyTime * 1000)
    .save();
};

const reverseFlightData = function(data) {
  const flyBackData = {
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: data.targetPosition,
    startPlanetId: data.targetId,
    targetPosition: data.returnDestination,
    targetId: data.returnPlanetId,
    targetType: Lib.TARGET.PLANET,
    targetHex: data.hex,
    hex: data.targetHex,
  };

  const startPosition = { ...flyBackData.startPosition };
  const targetPosition = { ...flyBackData.targetPosition };

  const startPositionWithOffset = { ...startPosition };
  const targetPositionWithOffset = { ...targetPosition };

  if (flyBackData.hex) {
    let center = new Hex(flyBackData.hex).center();
    startPositionWithOffset.x += center.x;
    startPositionWithOffset.y += center.y;

    center = new Hex(flyBackData.targetHex).center();
    targetPositionWithOffset.x += center.x;
    targetPositionWithOffset.y += center.y;
  }

  flyBackData.flyTime = Utils.calcFlyTime(
    startPositionWithOffset,
    targetPositionWithOffset,
    flyBackData.engineLevel,
  );

  return flyBackData;
};

const flyBack = function(data) {
  add(reverseFlightData(data));
};

export default {
  ...Lib,
  add,
  flyBack,
  reverseFlightData,
};
