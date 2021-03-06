import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import User from '/imports/modules/User/server/User';
import Utils from '/imports/modules/Space/lib/utils';
import Log from '/imports/modules/Log/server/Log';
import systemUser from '/moduls/user/server/systemUser';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/server';
import helpers from '/imports/lib/ui/helpers';
import Space from '../lib/space';
import Hex from '../../MutualSpace/lib/Hex';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';
import FlightEvents from './flightEvents';

// Загружаем зелёные гексы
const greenHexes = [];

const loadGreenHexes = function() {
  mutualSpaceCollection
    .find({
      username: systemUser.username,
    })
    .fetch()
    .forEach(hex => greenHexes.push(hex));
};

const findClosestHex = function(target) {
  return _(greenHexes).min(hex => (
    Utils.calcFlyTime((new Hex(hex)).center(), target, Meteor.settings.space.aiFleets.engineLevel)
  ));
};

const spawnAiFleet = function({
  missionType = 'patrolfleet',
  missionLevel = { $gte: 1, $lte: 2 },
  fleet = {
    'Unit/Human/Space/Mirage': 25,
  },
  targetUsername = { $exists: true, $ne: null },
} = {}) {
  if (greenHexes.length === 0) {
    loadGreenHexes();
  }

  const [randomHex] = mutualSpaceCollection.aggregate([
    { $match: { username: { $ne: systemUser.username } } },
    { $match: { username: targetUsername } },
    { $sample: { size: 1 } },
  ]);

  if (!randomHex) {
    return 0;
  }

  const [planet] = Game.Planets.Collection.aggregate([
    {
      $match: {
        username: randomHex.username,
        'mission.type': missionType,
        'mission.level': missionLevel,
      },
    },
    { $sample: { size: 1 } },
  ]);

  if (!planet) {
    return 0;
  }

  const existEvent = Space.collection.findOne({
    'data.targetId': planet._id,
    status: Space.filterActive,
  });
  if (existEvent) {
    return 0;
  }

  const targetHexCenter = (new Hex(randomHex).center());
  const closestHex = findClosestHex({
    x: planet.x + targetHexCenter.x,
    y: planet.y + targetHexCenter.y,
  });
  const startPosition = (new Hex(closestHex).center());

  const newArmyId = Game.Unit.createArmy(
    fleet,
    Game.Unit.location.SHIP,
    systemUser._id,
  );

  const flyTime = Utils.calcFlyTime(
    startPosition,
    {
      x: planet.x + targetHexCenter.x,
      y: planet.y + targetHexCenter.y,
    },
    Meteor.settings.space.aiFleets.engineLevel,
  );

  const flightData = {
    userId: systemUser._id,
    username: systemUser.username,
    targetType: FlightEvents.TARGET.PLANET,
    isHumans: true,
    startPosition: { x: 0, y: 0 },
    startPlanetId: null,
    targetPosition: {
      x: planet.x,
      y: planet.y,
    },
    targetId: planet._id,
    flyTime,
    engineLevel: Meteor.settings.space.aiFleets.engineLevel,
    isOneway: true,
    armyId: newArmyId,
    global: true,
    hex: closestHex,
    targetHex: randomHex,
  };

  FlightEvents.add(flightData);

  return 1;
};

if (
  !Meteor.settings.space.aiFleets
  || !Meteor.settings.space.aiFleets.schedule
  || !Meteor.settings.space.aiFleets.engineLevel
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Заданы не все настройки флотов Совета Галактики (см. settings.sample space.aiFleets)',
  );
}
if (Meteor.settings.last) {
  SyncedCron.add({
    name: 'Совет Галактики выслал флот',
    schedule: parser => parser.text(Meteor.settings.space.aiFleets.schedule),
    job() {
      spawnAiFleet();
    },
  });
}

Meteor.methods({
  'aiFleets.spawn'(options = {
    count: 1,
  }) {
    const user = User.getById();
    User.checkAuth({ user });

    if (user.role !== 'admin') {
      throw new Meteor.Error('Админамана нада!');
    }

    check(options, Object);

    const {
      count,
      missionType,
      missionLevel,
      fleet,
      targetUsername,
    } = options;

    check(count, Number);

    if (fleet && _(fleet).keys().some(id => (!humanSpaceUnits[id]) || fleet[id] < 1)) {
      throw new Meteor.Error('Косячный флот');
    }

    Log.method.call(this, { name: 'aiFleets.spawn', user });

    let sentCount = 0;
    for (let i = 0; i < count; i += 1) {
      sentCount += spawnAiFleet({
        missionType,
        missionLevel,
        fleet,
        targetUsername,
      });
    }
    if (sentCount > 0) {
      const message = `Совет выслал в поддержку ${sentCount} ${helpers.declension(sentCount, 'флот', '', 'а', 'ов')}`;
      Game.Broadcast.add(message);
    }
  },
});
