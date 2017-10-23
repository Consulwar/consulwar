import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import { spaceEvents } from '../lib/events';
import Flight from './flight';
import { calcFlyTime } from '../lib/utils';
import { Job } from '../lib/jobs';

const EVENT_TYPE = 'triggerAttack';

export default class TriggerAttack {
  static add(data, delay, userId) {
    const savedData = {
      ...data,
      userId,
    };

    const job = new Job(spaceEvents, EVENT_TYPE, savedData);
    job.delay(delay * 1000)
      .save();
  }
}

spaceEvents.processJobs(EVENT_TYPE, (job, cb) => {
  job.done();

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

  cb();

  if (reptilePlanets.length === 0) {
    return;
  }

  // calculate user health
  const userArmy = Game.Unit.getArmy(planet.armyId, userId);
  if (!userArmy || !userArmy.units) {
    console.log('Strange shit suddenly appeared! Space event id:', event._id);
    return; // strange shit suddenly appeared
  }

  const userHealth = Game.Unit.calcUnitsHealth(userArmy.units);

  // generate appropriate mission and calculate enemy health
  const mission = Game.Planets.generateMission(planet);

  const enemyFleet = _.clone(Game.Battle.items[mission.type].level[mission.level].enemies);
  for (const name in enemyFleet) {
    enemyFleet[name] = Game.Unit.rollCount(enemyFleet[name]);
  }
  const enemyHealth = Game.Unit.calcUnitsHealth({
    reptiles: {
      fleet: enemyFleet,
    },
  });

  // check attack possibility
  if (userHealth > enemyHealth * 0.5 /* && Game.Random.random() > 0.35 */) {
    return; // not this time
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

  Flight.toPlanet({
    startPosition,
    startPlanetId: nearestPlanet._id,
    targetPosition,
    targetId: planet._id,
    flyTime: calcFlyTime(startPosition, targetPosition, 1),
    isHumans: false,
    isOneway: false,
    engineLevel: 1,
    mission,
  }, userId);
});
