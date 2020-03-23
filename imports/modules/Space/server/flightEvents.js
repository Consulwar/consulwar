import { Meteor } from 'meteor/meteor';
import { Job } from '/moduls/game/lib/jobs';
import Game from '/moduls/game/lib/main.game';
import Space from '../lib/space';
import Lib from '../lib/flightEvents';
import Config from './config';
import Hex from '../../MutualSpace/lib/Hex';
import MutualCollection from '../../MutualSpace/lib/collection';
import Utils from '../lib/utils';

const add = function(data, delayOverride = data.flyTime * 1000) {
  const savedData = { ...data };

  if (!data.returnPlanetId) {
    savedData.returnPlanetId = data.startPlanetId;
  }

  const job = new Job(Space.jobs, Lib.EVENT_TYPE, savedData);
  job
    .retry({
      retries: Config.JOBS.retry.retries,
      wait: Config.JOBS.retry.wait,
    })
    .delay(delayOverride)
    .save();
};

const reverseFlightData = function(data) {
  const flyBackData = {
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: data.targetPosition,
    startPlanetId: data.targetId,
    targetPosition: { x: 0, y: 0 },
    targetId: data.returnPlanetId,
    targetType: Lib.TARGET.PLANET,
    targetHex: data.hex,
    hex: data.targetHex,
  };

  const returnPlanet = Game.Planets.Collection.findOne({ _id: flyBackData.targetId });
  if (returnPlanet) {
    flyBackData.targetPosition = { x: returnPlanet.x, y: returnPlanet.y };
  }

  const startPositionGlobal = { ...flyBackData.startPosition };
  const targetPositionGlobal = { ...flyBackData.targetPosition };

  const returnUser = Meteor.users.findOne({ _id: returnPlanet.userId });
  const returnHex = MutualCollection.findOne({ username: returnUser.username });
  if (returnHex) {
    flyBackData.targetHex = { x: returnHex.x, z: returnHex.z };

    let center = new Hex(flyBackData.hex).center();
    startPositionGlobal.x += center.x;
    startPositionGlobal.y += center.y;

    center = new Hex(returnHex).center();
    targetPositionGlobal.x += center.x;
    targetPositionGlobal.y += center.y;
  }

  flyBackData.flyTime = Utils.calcFlyTime(
    startPositionGlobal,
    targetPositionGlobal,
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
