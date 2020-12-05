import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import User from '/imports/modules/User/server/User';
import Utils from '/imports/modules/Space/lib/utils';
import Hex from '../../MutualSpace/lib/Hex';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';
import FlightEvents from './flightEvents';

if (
  !Meteor.settings.space.enemySpawner
  || Meteor.settings.space.enemySpawner.enabled === undefined
  || !Meteor.settings.space.enemySpawner.duration
  || !Meteor.settings.space.enemySpawner.engineLevel
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Заданы не все настройки флотов Совета Галактики (см. settings.sample space.enemySpawner)',
  );
}

const redHexes = [];

const loadRedHexes = function() {
  mutualSpaceCollection
    .find({
      username: {
        $exists: true,
        $eq: null,
      },
    })
    .fetch()
    .forEach(hex => redHexes.push(hex));
};

let usernameToClosestHex = {};

// Reset cache
Meteor.setInterval(() => {
  usernameToClosestHex = {};
}, 1000 * 60 * 60);

const findClosestHex = function(target, cacheUsername) {
  if (!usernameToClosestHex[cacheUsername]) {
    usernameToClosestHex[cacheUsername] = _(redHexes).min(hex => (
      Utils.calcFlyTime(
        (new Hex(hex)).center(),
        target,
        Meteor.settings.space.enemySpawner.engineLevel,
      )
    ));
  }
  return usernameToClosestHex[cacheUsername];
};

const spawnEnemy = function({
  missionType,
  missionLevel,
  targetUsername,
  senderUsername,
} = {}) {
  if (redHexes.length === 0) {
    loadRedHexes();
  }

  const targetUser = User.getByUsername({ username: targetUsername });

  const targetHex = mutualSpaceCollection.findOne({
    username: targetUsername,
  });

  if (!targetHex) {
    return;
  }

  const targetPlanet = Game.Planets.Collection.findOne({
    username: targetUsername,
    isHome: true,
  });

  const targetHexCenter = (new Hex(targetHex).center());
  const closestHex = findClosestHex({
    x: targetPlanet.x + targetHexCenter.x,
    y: targetPlanet.y + targetHexCenter.y,
  }, targetUsername);
  const startPosition = (new Hex(closestHex).center());

  const { engineLevel } = Meteor.settings.space.enemySpawner;

  const flyTime = Utils.calcFlyTime(
    startPosition,
    {
      x: targetPlanet.x + targetHexCenter.x,
      y: targetPlanet.y + targetHexCenter.y,
    },
    engineLevel,
  );

  const flightData = {
    targetType: FlightEvents.TARGET.PLANET,
    userId: targetUser._id,
    username: targetUser.username,
    startPosition: { x: 0, y: 0 },
    targetPosition: {
      x: targetPlanet.x,
      y: targetPlanet.y,
    },
    targetId: targetPlanet._id,
    flyTime,
    isHumans: false,
    isOneway: true,
    engineLevel,
    mission: {
      type: missionType,
      level: missionLevel,
    },
    hex: {
      x: closestHex.x,
      z: closestHex.z,
    },
    targetHex: {
      x: targetHex.x,
      z: targetHex.z,
    },

    noReward: true,
    senderUsername,
  };

  FlightEvents.add(flightData);
};

export default spawnEnemy;
