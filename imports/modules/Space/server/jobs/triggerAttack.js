import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';

import Space from '../../lib/space';
import FlightEvents from '../flightEvents';
import Utils from '../../lib/utils';
import Config from '../config';
import Lib from '../../lib/triggerAttack';

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

    const planet = Game.Planets.getOne(data.targetPlanet, userId);

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

    const userHealth = Game.Unit.calcUnitsHealth(userArmy.units);

    // generate appropriate mission and calculate enemy health
    const mission = Game.Planets.generateMission(planet);

    const enemyFleet = _.clone(Game.Battle.items[mission.type].level[mission.level].enemies);
    _(enemyFleet).mapObject((val, name) => Game.Unit.rollCount(enemyFleet[name]));

    const enemyHealth = Game.Unit.calcUnitsHealth({
      reptiles: {
        fleet: enemyFleet,
      },
    });

    // check attack possibility
    if (userHealth > enemyHealth * 0.5 /* && Game.Random.random() > 0.35 */) {
      return done(); // not this time
    }

    // find nearest planet
    let nearestPlanet = null;
    let minDistance = Number.MAX_VALUE;
    let curDistance = Number.MAX_VALUE;
    for (let i = 0; i < reptilePlanets.length; i += 1) {
      curDistance = Game.Planets.calcDistance(reptilePlanets[i], planet);
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

    FlightEvents.add({
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
    });

    return done();
  },
);
