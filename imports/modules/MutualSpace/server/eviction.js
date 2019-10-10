import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import FlightEvents from '/imports/modules/Space/server/flightEvents';
import BattleEvents from '/imports/modules/Space/server/battleEvents';
import Space from '/imports/modules/Space/lib/space';
import Lib from '/imports/modules/Space/lib/flightEvents';
import Utils from '/imports/modules/Space/lib/utils';
import BattleCollection from '/moduls/battle/lib/imports/collection';
import Battle from '/moduls/battle/lib/imports/battle';
import collection from '../lib/collection';
import Hex from '../lib/Hex';

const alongLine = function(start, finish, k) {
  const vector = {
    x: finish.x - start.x,
    y: finish.x - start.y,
  };
  return {
    x: start.x + (vector.x * k),
    y: start.y + (vector.y * k),
  };
};

const calcBackToPlanetData = function(event, planet, hex) {
  const { data } = event;

  const startPosition = { ...data.startPosition };
  const targetPosition = { ...data.targetPosition };

  const startPositionWithOffset = { ...startPosition };
  const targetPositionWithOffset = { ...targetPosition };

  let center = new Hex(data.hex).center();
  startPositionWithOffset.x += center.x;
  startPositionWithOffset.y += center.y;

  center = new Hex(data.targetHex).center();
  targetPositionWithOffset.x += center.x;
  targetPositionWithOffset.y += center.y;

  const totalFlyDistance = Utils.calcDistance(
    startPositionWithOffset,
    targetPositionWithOffset,
  );

  const currentDistance = Utils.calcDistanceByTime(
    Game.getCurrentTime() - Game.dateToTime(event.created),
    totalFlyDistance,
    Utils.calcMaxSpeed(data.engineLevel),
    Utils.calcAcceleration(data.engineLevel),
  );

  let k = currentDistance / totalFlyDistance;
  if (k > 1) {
    k = 1;
  } else if (k < 0) {
    k = 0;
  }

  const currentPosition = alongLine(startPositionWithOffset, targetPositionWithOffset, k);

  const currentPositionInHex = { ...currentPosition };

  center = new Hex(hex).center();

  currentPositionInHex.x -= center.x;
  currentPositionInHex.y -= center.y;

  const targetPositionInHex = { x: planet.x, y: planet.y };
  const newTargetPositionWithOffset = { ...targetPositionInHex };
  newTargetPositionWithOffset.x += center.x;
  newTargetPositionWithOffset.y += center.y;

  const flyTime = Utils.calcFlyTime(
    currentPosition,
    newTargetPositionWithOffset,
    data.engineLevel,
  );

  return {
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: currentPositionInHex,
    targetPosition: targetPositionInHex,
    flyTime,
    targetId: planet._id,
    targetType: Lib.TARGET.PLANET,
    hex,
    targetHex: hex,
  };
};

const sendPlanetFleetToHome = function(planet, fromHex, hex, user) {
  Game.Unit.moveArmy(planet.armyId, Game.Unit.location.SHIP);

  Game.Planets.update({
    ...planet,
    armyId: null,
    armyUsername: null,
  });

  const startPosition = {
    x: planet.x,
    y: planet.y,
  };
  const startPositionWithOffset = { ...startPosition };

  let center = new Hex(fromHex).center();
  startPositionWithOffset.x += center.x;
  startPositionWithOffset.y += center.y;

  const target = Game.Planets.Collection.findOne({
    username: planet.armyUsername,
    isHome: true,
  });

  const targetPosition = {
    x: target.x,
    y: target.y,
  };
  const targetPositionWithOffset = { ...targetPosition };

  center = new Hex(hex).center();
  targetPositionWithOffset.x += center.x;
  targetPositionWithOffset.y += center.y;

  const engineLevel = Game.Planets.getEngineLevel(user);

  const flyTime = Utils.calcFlyTime(
    startPositionWithOffset,
    targetPositionWithOffset,
    engineLevel,
  );

  const flightData = {
    userId: target.userId,
    username: target.username,
    targetType: FlightEvents.TARGET.PLANET,
    isHumans: true,
    startPosition,
    startPlanetId: planet._id,
    targetPosition,
    targetId: target._id,
    flyTime,
    engineLevel,
    isOneway: true,
    armyId: planet.armyId,
  };

  flightData.hex = fromHex;
  flightData.targetHex = hex;

  FlightEvents.add(flightData);
};

const evict = function(username) {
  const targetUser = Meteor.users.findOne({ username });

  const hex = collection.findOne({ username });
  const hexDB = { x: hex.x, z: hex.z };

  const hasBattle = Space.collection.findOne({
    type: BattleEvents.EVENT_TYPE,
    status: Space.filterActive,
    'data.targetHex': hexDB,
  });

  if (hasBattle) {
    Log.add({ name: 'В галактике игрока проходят сражения.', info: username });
    return;
  }

  const inBattle = BattleCollection.find({
    'options.isEarth': { $exists: false },
    userNames: targetUser.username,
    status: Battle.Status.progress,
  });

  if (inBattle) {
    Log.add({ name: 'Игрок участвует в космических сражениях.', info: username });
    return;
  }

  // remove hex fields in local fleets
  Space.collection.update({
    'data.userId': targetUser._id,
    status: Space.filterActive,
    type: FlightEvents.EVENT_TYPE,
    'data.hex': hexDB,
    'data.targetHex': hexDB,
  }, {
    $unset: {
      'data.hex': 1,
      'data.targetHex': 1,
    },
  }, {
    multi: true,
  });

  const targetUserHomePlanet = Game.Planets.getBase(targetUser._id);

  // Что свое летело не дома - летит домой
  Space.collection.find({
    'data.userId': targetUser._id,
    status: Space.filterActive,
    type: FlightEvents.EVENT_TYPE,
    'data.hex': { $exists: true },
  }).fetch().forEach((event) => {
    Space.collection.update({
      _id: event._id,
    }, {
      $set: {
        data: calcBackToPlanetData(event, targetUserHomePlanet, hexDB),
      },
    });
  });

  // Что чужое летело - поворачиваем домой
  Space.collection.find({
    status: Space.filterActive,
    type: FlightEvents.EVENT_TYPE,
    'data.targetHex': hexDB,
  }).fetch().forEach((event) => {
    const guestHomePlanet = Game.Planets.getBase(event.data.userId);
    const guestHomeHex = collection.findOne({ username: event.data.username });
    const guestHomeHexDB = { x: guestHomeHex.x, z: guestHomeHex.z };

    Space.collection.update({
      _id: event._id,
    }, {
      $set: {
        data: calcBackToPlanetData(event, guestHomePlanet, guestHomeHexDB),
      },
    });
  });

  // Что чужое было - улетает домой
  Game.Planets.Collection.find({
    $and: [
      { userId: targetUser._id },
      { armyUsername: { $exists: true } },
      { armyUsername: { $ne: null } },
      { armyUsername: { $ne: targetUser.username } },
    ],
  }).fetch().forEach((planet) => {
    const guestUser = Meteor.users.findOne(planet.armyUsername);
    const guestHex = collection.findOne({ username: planet.armyUsername });
    const guestHexDB = { x: guestHex.x, z: guestHex.z };
    sendPlanetFleetToHome(planet, hexDB, guestHexDB, guestUser);
  });

  // Что своё было не дома - улетает домой
  Game.Planets.Collection.find({
    $and: [
      { userId: { $ne: targetUser._id } },
      { armyUsername: { $exists: true } },
      { armyUsername: { $ne: null } },
      { armyUsername: targetUser.username },
    ],
  }).fetch().forEach((planet) => {
    const otherHex = collection.findOne({ username: planet.armyUsername });
    const otherHexDB = { x: otherHex.x, z: otherHex.z };
    sendPlanetFleetToHome(planet, otherHexDB, hexDB, targetUser);
  });

  // Сброс своих колоний
  Game.Planets.Collection.update({
    $and: [
      { userId: targetUser._id },
      { minerUsername: { $exists: true } },
      { minerUsername: { $ne: null } },
      { minerUsername: { $ne: targetUser.username } },
    ],
  }, {
    $set: {
      status: Game.Planets.STATUS.NOBODY,
      minerUsername: null,
      timeArtefacts: null,
    },
  }, { multi: true });

  // Сброс чужих колоний
  Game.Planets.Collection.update({
    $and: [
      { userId: { $ne: targetUser._id } },
      { minerUsername: targetUser.username },
    ],
  }, {
    $set: {
      status: Game.Planets.STATUS.NOBODY,
      minerUsername: null,
      timeArtefacts: null,
    },
  }, { multi: true });

  collection.update({
    username,
  }, {
    $unset: {
      username: 1,
    },
  });
  Log.add({ name: 'Выселен', info: username });
};

const evictInactive = function() {
  const inactivityDate = new Date();
  inactivityDate.setDate(inactivityDate.getDate() - Meteor.settings.space.autoEviction.inactivityDays);
  const inactiveUsernames = Meteor.users.find({
    username: { $ne: '✯ Совет Галактики ✯' },
    'status.online': { $ne: true },
    'status.lastLogout': { $not: { $gt: inactivityDate } },
  }).fetch().map(user => user.username);
  collection.find({ username: { $in: inactiveUsernames } }).forEach((hex) => {
    evict(hex.username);
  });
};

if (
  !Meteor.settings.space.autoEviction
  || !Meteor.settings.space.autoEviction.schedule
  || !Meteor.settings.space.autoEviction.inactivityDays
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Заданы не все настройки автовыселения (см. settings.sample space.autoEvictionSchedule)',
  );
}
if (Meteor.settings.last) {
  SyncedCron.add({
    name: 'Выселение неактивных игроков',
    schedule: parser => parser.text(Meteor.settings.space.autoEviction.schedule),
    job() {
      evictInactive();
    },
  });
}

export default evict;
