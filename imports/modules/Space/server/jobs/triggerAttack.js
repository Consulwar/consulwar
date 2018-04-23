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
    workTimeout: Config.JOBS.workTimeout,
  },
  (job, cb) => {
    try {
      const done = function() {
        job.done();
        cb();
      };

      const { data } = job;
      const jobUserId = data.userId;

      const planet = Game.Planets.getOne(data.targetPlanet);

      const reptilePlanets = [];
      const planets = Game.Planets.getAll(planet.userId).fetch();
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
      const userUnits = userArmy ? userArmy.units : null;
      const targetUserId = userArmy ? userArmy.user_id : jobUserId;
      if (!userUnits && planet.minerUsername == null) {
        return done(); // nothing to attack
      }

      const userHealth = Game.Unit.calcUnitsHealth(userUnits, targetUserId);

      // generate appropriate mission and calculate enemy health
      const mission = Game.Planets.generateMission(planet);

      let enemyFleet = _.clone(Game.Battle.items[mission.type].level[mission.level].enemies);
      enemyFleet = _.mapObject(enemyFleet, (val, name) => Game.Unit.rollCount(enemyFleet[name]));

      const enemyHealth = Game.Unit.calcUnitsHealth(enemyFleet, targetUserId);

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
        userId: jobUserId,
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

      const galaxy = mutualSpaceCollection.findOne({ username: planet.username });
      if (galaxy) {
        flightData.hex = new Hex(galaxy);
        flightData.targetHex = flightData.hex;
      }

      FlightEvents.add(flightData);

      return done();
    } catch (err) {
      job.fail(err.stack);
      cb(err.stack);
      return undefined;
    }
  },
);
