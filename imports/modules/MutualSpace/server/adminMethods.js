import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import User from '../../User/server/User';
import Game from '../../../../moduls/game/lib/main.game';
import FlightEvents from '../../Space/server/flightEvents';
import BattleEvents from '../../Space/server/battleEvents';
import Space from '../../Space/lib/space';
import collection from '../lib/collection';
import Log from '../../Log/server/Log';
import Lib from '../../Space/lib/flightEvents';
import Hex from '../lib/Hex';
import Utils from '../../Space/lib/utils';
import Config from '../lib/config';
import SpaceConfig from '../../Space/server/config';

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

const sendPlanetFleetToHome = function(planet, fromHex, hex) {
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

  const engineLevel = Game.Planets.getEngineLevel(Meteor.user());

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

Meteor.methods({
  'mutualSpace.comeBack'(username) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'mutualSpace.comeBack', user });

    const isAdmin = ['admin'].indexOf(user.role) >= 0;

    if (!isAdmin) {
      throw new Meteor.Error('Не админ.');
    }

    check(username, String);

    const targetUser = Meteor.users.findOne({ username });

    if (!targetUser) {
      throw new Meteor.Error('Игрок не найден');
    }

    const hex = collection.findOne({ username });
    if (!hex) {
      throw new Meteor.Error('Игрок не в общем космосе.');
    }

    const hexDB = { x: hex.x, z: hex.z };

    const hasBattle = Space.collection.findOne({
      type: BattleEvents.EVENT_TYPE,
      status: Space.filterActive,
      'data.targetHex': hexDB,
    });

    if (hasBattle) {
      throw new Meteor.Error('В галактике игрока проходят сражения.');
    }

    // remove hex fields in local fleets
    Space.collection.update({
      'data.userId': user._id,
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
      'data.userId': user._id,
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
      const homePlanet = Game.Planets.getBase(event.data.userId);
      const homeHex = collection.findOne({ username: event.data.username });
      const homeHexDB = { x: homeHex.x, z: homeHex.z };

      Space.collection.update({
        _id: event._id,
      }, {
        $set: {
          data: calcBackToPlanetData(event, homePlanet, homeHexDB),
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
      const homeHex = collection.findOne({ username: planet.armyUsername });
      const homeHexDB = { x: homeHex.x, z: homeHex.z };
      sendPlanetFleetToHome(planet, hexDB, homeHexDB);
    });

    collection.update({
      username,
    }, {
      $unset: {
        username: 1,
      },
    });
  },

  'mutualSpace.putInHex'(username, hex) {
    const user = User.getById();
    User.checkAuth({ user });

    check(username, String);
    check(hex, Object);

    Log.method.call(this, { name: 'mutualSpace.putInHex', user });

    if (user.role !== 'admin') {
      throw new Meteor.Error('Админамана нада!');
    }

    const targetUser = User.getByUsername({ username });

    if (!targetUser) {
      throw new Meteor.Error('Пользователь не найден');
    }

    if (collection.findOne({ username: targetUser.username })) {
      throw new Meteor.Error('Выход в общий космос уже осуществлен.');
    }

    if (targetUser.rating < Config.ACCESS_RATING) {
      throw new Meteor.Error('Недостаточно рейтинга.');
    }

    const lastFun = Game.Planets.getLastFunTime({ userId: targetUser._id });
    if (lastFun + (30 * SpaceConfig.FUN_PERIOD) > Game.getCurrentTime()) {
      throw new Meteor.Error('Ты не готов!');
    }

    const homePlanet = Game.Planets.getBase(targetUser._id);
    if (!homePlanet) {
      throw new Meteor.Error('Перед выходом в общий космос необходимо разведать все планеты.');
    }

    const { galactic } = homePlanet;
    const planets = Game.Planets.getAll(targetUser._id).fetch();
    const hands = {};
    let allCount = 0;
    planets.forEach(({ hand, segment }) => {
      if (!hands[hand]) {
        hands[hand] = {};
      }

      if (!hands[hand][segment]) {
        hands[hand][segment] = true;
        allCount += 1;
      }
    });

    if (allCount !== ((galactic.hands * galactic.segments) + 1)) {
      throw new Meteor.Error('Перед выходом в общий космос необходимо разведать все планеты.');
    }

    const targetHex = collection.findOne({ x: hex.x, z: hex.z });

    if (!targetHex) {
      throw new Meteor.Error('Гекс не найден');
    }

    if (targetHex.username) {
      throw new Meteor.Error('Гекс уже занят');
    }

    collection.update({
      x: hex.x,
      z: hex.z,
    }, {
      $set: {
        username: targetUser.username,
      },
    });

    Space.collection.update({
      'data.userId': targetUser._id,
      status: Space.filterActive,
    }, {
      $set: {
        'data.hex': hex,
        'data.targetHex': hex,
      },
    }, {
      multi: true,
    });

    return collection.find({}).fetch();
  },
});
