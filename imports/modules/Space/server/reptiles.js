import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Game from '/moduls/game/lib/main.game';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';
import Space from '../lib/space';
import FlightEvents from './flightEvents';
import Utils from '../lib/utils';
import Config from './config';
import Hex from '../../MutualSpace/lib/Hex';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';

const { ATTACK_PLAYER_PERIOD, TRADE_FLEET_PERIOD } = Config;

const spawnTradeFleet = function(hand, segment) {
  const user = Meteor.user();

  // find planets inside hand
  const finishPlanets = Game.Planets.Collection.find({
    userId: user._id,
    hand,
    mission: { $ne: null },
  }).fetch();

  // save segment planets as start planets
  let n = finishPlanets.length;
  const startPlanets = [];
  while (n > 0) {
    n -= 1;
    if (finishPlanets[n].segment === segment) {
      startPlanets.push(finishPlanets[n]);
      finishPlanets.splice(n, 1);
    }
  }

  if (startPlanets.length > 0 && finishPlanets.length > 0) {
    // get two random planets
    const startPlanet = startPlanets[Game.Random.interval(0, startPlanets.length - 1)];
    const targetPlanet = finishPlanets[Game.Random.interval(0, finishPlanets.length - 1)];

    // send ship
    const startPosition = {
      x: startPlanet.x,
      y: startPlanet.y,
    };

    const targetPosition = {
      x: targetPlanet.x,
      y: targetPlanet.y,
    };

    let mission = Game.Planets.generateMission(startPlanet);
    if (!mission) {
      mission = {
        level: Game.Random.interval(1, 10),
      };
    }
    mission.type = 'tradefleet';

    const engineLevel = 0;
    const flyTime = Utils.calcFlyTime(startPosition, targetPosition, engineLevel);

    const flightData = {
      targetType: FlightEvents.TARGET.PLANET,
      userId: user._id,
      username: user.username,
      startPosition,
      startPlanetId: startPlanet._id,
      targetPosition,
      targetId: targetPlanet._id,
      flyTime,
      isHumans: false,
      isOneway: true,
      engineLevel,
      mission,
      hand: startPlanet.hand,
      segment: startPlanet.segment,
    };

    const galaxy = mutualSpaceCollection.findOne({ username: user.username });
    if (galaxy) {
      flightData.hex = new Hex(galaxy);
      flightData.targetHex = flightData.hex;
    }

    FlightEvents.add(flightData);
  }
};

const spawnPrisonersFleet = function() {
  const [first, second] = mutualSpaceCollection.aggregate([
    { $match: { username: { $exists: true, $eq: null } } },
    { $sample: { size: 2 } },
  ]);

  const startPosition = (new Hex(first)).center();
  const targetPosition = (new Hex(second)).center();

  const { engineLevel } = Meteor.settings.space.prisonersFleet;
  const flyTime = Utils.calcFlyTime(startPosition, targetPosition, engineLevel);

  const flightData = {
    targetType: FlightEvents.TARGET.SHIP,
    startPosition: { x: 0, y: 0 },
    targetPosition: { x: 0, y: 0 },
    flyTime,
    isHumans: false,
    isOneway: true,
    engineLevel,
    mission: {
      type: 'prisoners',
      level: 1,
    },
    hex: { x: first.x, z: first.z },
    targetHex: { x: second.x, z: second.z },
  };

  FlightEvents.add(flightData);
};

const actualizeTradeFleets = function() {
  // find fleets and group by sector
  Space.collection.find({
    'data.userId': Meteor.userId(),
    status: Space.filterActive,
  });

  const fleets = Space.collection.find({
    'data.userId': Meteor.userId(),
    type: FlightEvents.EVENT_TYPE,
    after: { $gt: Game.getCurrentTime() * 1000 },
    'data.mission.type': 'tradefleet',
  }).fetch();

  let i = 0;
  const fleetsBySector = {};
  for (i = 0; i < fleets.length; i += 1) {
    const fleet = fleets[i];
    if (!fleetsBySector[fleet.info.hand]) {
      fleetsBySector[fleet.info.hand] = [];
    }
    fleetsBySector[fleet.info.hand].push(fleet.info.segment);
  }

  // find occupied hands and sectors
  const occupied = {};
  const colonies = Game.Planets.getColonies();

  for (i = 0; i < colonies.length; i += 1) {
    const planet = colonies[i];
    if (!occupied[planet.hand]) {
      occupied[planet.hand] = [];
    }
    occupied[planet.hand].push(planet.segment);
  }

  // check each occupied hand
  _(occupied).keys().forEach((hand) => {
    // aggregate and sort hand sectors
    const sectors = [];
    for (i = 0; i < occupied[hand].length; i += 1) {
      const segment = occupied[hand][i];
      if (sectors.indexOf(segment) === -1) {
        sectors.push(segment);
      }
      if (segment > 0 && sectors.indexOf(segment - 1) === -1) {
        sectors.push(segment - 1);
      }
      if (segment < 9 && sectors.indexOf(segment + 1) === -1) {
        sectors.push(segment + 1);
      }
    }

    sectors.sort(function(a, b) {
      return a - b;
    });

    // calculate intervals
    const intervals = [];
    let currentInterval = 0;

    intervals.push([sectors[0]]);

    for (i = 1; i < sectors.length; i += 1) {
      if (sectors[i] - sectors[i - 1] > 1) {
        currentInterval += 1;
        intervals[currentInterval] = [];
      }
      intervals[currentInterval].unshift(sectors[i]);
    }

    for (i = 0; i < intervals.length; i += 1) {
      const fleetsCount = Math.round(intervals[i].length / 3);
      const sectorsCount = Math.ceil(intervals[i].length / fleetsCount);
      for (let k = 0; k < fleetsCount; k += 1) {
        const startInterval = intervals[i].slice(k * sectorsCount, (k + 1) * sectorsCount);

        // check existing fleet inside interval
        let hasFleet = false;
        for (let n = 0; n < startInterval.length; n += 1) {
          if (fleetsBySector[hand]
            && fleetsBySector[hand].indexOf(startInterval[n]) !== -1
          ) {
            hasFleet = true;
            break;
          }
        }
        if (!hasFleet) {
          // spawn trade fleet
          spawnTradeFleet(
            parseInt(hand, 10),
            startInterval[Game.Random.interval(0, startInterval.length - 1)],
          );
        }
      }
    }
  });
};

const getSourceMissionPlanet = function() {
  // find available start planets
  const planets = Game.Planets.getAll().fetch();

  const result = planets.filter(planet => planet.mission && !planet.isHome);

  if (result.length > 0) {
    // choose start planet
    const rand = Game.Random.interval(0, result.length - 1);
    const startPlanet = result[rand];

    return startPlanet;
  }

  return null;
}

const sendReptileFleetToPlanet = function({
  planetId,
  targetPlanet = Game.Planets.getOne(planetId),
  mission = (
    targetPlanet.isHome
      ? Game.Planets.getReptileAttackMission()
      : Game.Planets.generateMission(targetPlanet)
  ),
  startPlanet = getSourceMissionPlanet(),
}) {
  if (!mission) {
    throw new Meteor.Error('Не получилось сгенерировать миссию для нападения');
  }

  if (!startPlanet) {
    return;
  }

  // send ship
  const startPosition = {
    x: startPlanet.x,
    y: startPlanet.y,
  };

  const targetPosition = {
    x: targetPlanet.x,
    y: targetPlanet.y,
  };

  const engineLevel = 0;

  const user = Meteor.user();

  const flightData = {
    targetType: FlightEvents.TARGET.PLANET,
    userId: user._id,
    username: user.username,
    startPosition,
    startPlanetId: startPlanet._id,
    targetPosition,
    targetId: targetPlanet._id,
    flyTime: Utils.calcFlyTime(startPosition, targetPosition, engineLevel),
    isHumans: false,
    isOneway: false,
    engineLevel,
    mission,
  };

  const galaxy = mutualSpaceCollection.findOne({ username: user.username });
  if (galaxy) {
    flightData.hex = new Hex(galaxy);
    flightData.targetHex = flightData.hex;
  }

  FlightEvents.add(flightData);
};

const actualize = function({ user }) {
  const timeCurrent = Game.getCurrentTime();

  // Try to attack player
  const timeLastAttack = Game.Planets.getLastAttackTime();
  const attacks = Math.floor((timeCurrent - timeLastAttack) / ATTACK_PLAYER_PERIOD);

  if (attacks > 0 && Game.User.getLevel() > 0) {
    for (let i = 0; i < attacks; i += 1) {
      let targetPlanet = null;
      const chances = Game.Planets.getReptileAttackChance();

      if (chances.home >= Game.Random.interval(0, 100)) {
        // choose base planet
        targetPlanet = Game.Planets.getBase();
      } else if (chances.colony >= Game.Random.interval(0, 100)) {
        // choose from planets with army, exclude base planet
        const planets = Game.Planets.getHumanPlanetsByUsername(user.username);
        let n = planets.length;
        while (n > 0) {
          n -= 1;
          if (planets[n].isHome) {
            planets.splice(n, 1);
          }
        }
        if (planets.length > 0) {
          targetPlanet = planets[Game.Random.interval(0, planets.length - 1)];
        }
      }

      if (targetPlanet) {
        sendReptileFleetToPlanet({ planetId: targetPlanet._id });
        break; // maximum 1 simultaneous attack
      }
    }

    Game.Planets.setLastAttackTime(timeLastAttack + (attacks * ATTACK_PLAYER_PERIOD));
  }

  // Try to spawn trade fleet
  // TODO: Придумать что делать со временем спавна
  //       сейчас все флоты появляются одновременно
  const timeLastTradeFleet = Game.Planets.getLastTradeFleetTime();
  if (timeCurrent >= timeLastTradeFleet + TRADE_FLEET_PERIOD) {
    actualizeTradeFleets();
    Game.Planets.setLastTradeFleetTime(timeCurrent);
  }
};

const stealUserResources = function({ enemyArmy, userId, battle }) {
  const userResources = Game.Resources.getValue({ userId });
  const stealCost = Game.Unit.calculateBaseArmyCost(enemyArmy);

  // converting some uniresources to humans
  const humansRatio = 0.5;
  const rating = Game.Resources.calculateRatingFromResources(stealCost);
  _(stealCost).pairs().forEach(([resName, value]) => {
    stealCost[resName] = Math.round(value * (1 - humansRatio));
  });
  stealCost.humans = Math.round(rating * humansRatio * 0.5);

  const bunker = SpecialEffect.getValue({
    hideEffects: true,
    obj: { id: 'Unique/bunker' },
    userId,
  });

  _(stealCost).pairs().forEach(([resName, value]) => {
    const stealAmount = Math.floor(value * 0.2); // 20%

    let userAmount = (userResources[resName] && userResources[resName].amount)
      ? userResources[resName].amount
      : 0;

    // save some resources
    if (bunker && bunker[resName]) {
      if (bunker[resName] < userAmount) {
        userAmount -= bunker[resName];
      } else {
        userAmount = 0;
      }
    }

    if (stealAmount > userAmount) {
      stealCost[resName] = userAmount;
    } else {
      stealCost[resName] = stealAmount;
    }
  });

  Game.Resources.steal(stealCost, userId);

  // save history
  if (battle) {
    battle.update({
      $set: {
        lostResources: stealCost,
      },
    });
  }
};

if (
  !Meteor.settings.space.prisonersFleet
  || !Meteor.settings.space.prisonersFleet.schedule
  || !Meteor.settings.space.prisonersFleet.engineLevel
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Заданы не все настройки чистки задач (см. settings.sample space.prisonersFleet)',
  );
}
if (Meteor.settings.last) {
  SyncedCron.add({
    name: 'Отправка флота с заключенными',
    schedule: parser => parser.text(Meteor.settings.space.prisonersFleet.schedule),
    job() {
      spawnPrisonersFleet();
    },
  });
}

export default {
  spawnTradeFleet,
  sendReptileFleetToPlanet,
  actualize,
  stealUserResources,
};
