import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';

import Space from '../../lib/space';
import FlightEvents from '../flightEvents';
import Utils from '../../lib/utils';
import Config from '../config';
import Lib from '../../lib/triggerAttack';
import mutualSpaceCollection from '../../../MutualSpace/lib/collection';
import Hex from '../../../MutualSpace/lib/Hex';

export default Space.jobs.processJobs(
  Lib.EVENT_TYPE,
  {
    concurrency: Config.JOBS.concurrency,
    payload: Config.JOBS.payload,
    pollInterval: Config.JOBS.pollInterval,
    prefetch: Config.JOBS.prefetch,
  },
  (job, cb) => {
    const done = function() {
      job.done();
      cb();
    };

    const data = job.data;
    const userId = data.userId;

    const planet = Game.Planets.getOne(data.targetPlanet);

    const reptilePlanets = [];
    const planets = Game.Planets.getAll(userId).fetch();
    for (let n = 0; n < planets.length; n += 1) {
      if (planets[n].hand === planet.hand
        && planets[n].segment === planet.segment
        && planets[n].mission
      ) {
        reptilePlanets.push(planets[n]);
      }
    }

    if (reptilePlanets.length === 0) {
      return done();
    }

    // calculate user health
    const userArmy = Game.Unit.getArmy({ id: planet.armyId });
    if (!userArmy || !userArmy.units) {
      return done(); // strange shit suddenly appeared
    }

    const userHealth = Game.Unit.calcUnitsHealth(userArmy.units, userId);

    // generate appropriate mission and calculate enemy health
    const mission = Game.Planets.generateMission(planet, userId);

    const enemyFleet = _.clone(Game.Battle.items[mission.type].level[mission.level].enemies);
    _(enemyFleet).mapObject((val, name) => Game.Unit.rollCount(enemyFleet[name]));

    const enemyHealth = Game.Unit.calcUnitsHealth({
      reptiles: {
        fleet: enemyFleet,
      },
    }, userId);

    // check attack possibility
    if (userHealth > enemyHealth * 0.5 /* && Game.Random.random() > 0.35 */) {
      return done(); // not this time
    }

    // find nearest planet
    let nearestPlanet = null;
    let minDistance = Number.MAX_VALUE;
    let curDistance = Number.MAX_VALUE;
    for (let i = 0; i < reptilePlanets.length; i += 1) {
      curDistance = Utils.calcDistance(reptilePlanets[i], planet);
      if (!nearestPlanet || curDistance < minDistance) {
        nearestPlanet = reptilePlanets[i];
        minDistance = curDistance;
      }
    }

    // perform attack
    const startPosition = {
      x: nearestPlanet.x,
      y: nearestPlanet.y,
    };

    const targetPosition = {
      x: planet.x,
      y: planet.y,
    };

    const flightData = {
      targetType: FlightEvents.TARGET.PLANET,
      userId,
      username: data.username,
      startPosition,
      startPlanetId: nearestPlanet._id,
      targetPosition,
      targetId: planet._id,
      flyTime: Utils.calcFlyTime(startPosition, targetPosition, 1),
      isHumans: false,
      isOneway: false,
      engineLevel: 1,
      mission,
    };

    const galaxy = mutualSpaceCollection.findOne({ username: data.username });
    if (galaxy) {
      flightData.hex = flightData.targetHex = new Hex(galaxy);
    }

    FlightEvents.add(flightData);

    return done();
  },
);
