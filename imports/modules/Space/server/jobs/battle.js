import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import Battle from '/moduls/battle/server/battle';

import Config from '../config';
import Space from '../../lib/space';
import Lib from '../../lib/battle';
import FlightEvents from '../flightEvents';
import battleDelay from '../battleDelay';
import Reptiles from '../reptiles';
import Utils from '../../lib/utils';

const reptilesWin = function({ battle, roundResult, planet, data }) {
  if (planet && !planet.isHome && planet.status === Game.Planets.STATUS.HUMANS) {
    planet.status = Game.Planets.STATUS.NOBODY;
    planet.minerUsername = null;
  }

  const army = roundResult.left[Battle.ENEMY_SIDE];

  if (planet) {
    if (data.isOneway && !data.isHumans) {
      // Остаются на планете
      planet.armyId = null;
      planet.armyUsername = null;

      if (planet.mission) {
        // restore mission units
        planet.mission.units = null;
      } else {
        // fill empty planet
        planet.mission = {
          type: data.mission.type === 'tradefleet' ? 'patrolfleet' : data.mission.type,
          level: data.mission.level,
          units: army.reptiles.fleet,
        };
      }
    } else if (!data.isHumans) {
      // Возвращаются
      if (planet.isHome) {
        Reptiles.stealUserResources({
          enemyArmy: army,
          userId: data.userId,
          battle: battle,
        });
      } else if (planet.mission) {
        // restore mission units
        planet.mission.units = null;
      }

      FlightEvents.flyBack(data.reptileData || data);
    }
  } else {
    // Продолжают прерванный боем полет
    const { reptileData } = data;
    const startPosition = data.targetPosition;
    const targetPlanet = Game.Planets.getOne(reptileData.targetId);
    const targetPosition = {
      x: targetPlanet.x,
      y: targetPlanet.y,
    };

    FlightEvents.add({
      ...reptileData,
      startPosition,
      targetPosition,
      flyTime: Utils.calcFlyTime(startPosition, targetPosition, 1),
    });
  }
};

const humansWin = function({ battle, roundResult, users, planet, data }) {
  users.forEach((user) => {
    const army = roundResult.leftByUsername[user.username];

    const newArmyId = Game.Unit.createArmy(
      army,
      Game.Unit.location.SHIP,
      user._id,
    );

    if (planet) {
      planet.mission = null;
    }

    if (planet && data.isOneway && user._id === data.userId) {
      // Остаемся на планете
      if (planet.isHome || planet.armyId) {
        // merge army
        const destArmyId = (planet.isHome)
          ? Game.Unit.getHomeFleetArmy({ userId: user._id })._id
          : planet.armyId;
        Game.Unit.mergeArmy(newArmyId, destArmyId, user._id);
      } else {
        // move army
        Game.Unit.moveArmy(newArmyId, Game.Unit.location.PLANET);
        planet.armyId = newArmyId;
        planet.armyUsername = user.username;
      }
    } else {
      // Возвращаемся
      const flightData = {
        ...data,
        targetType: FlightEvents.TARGET.PLANET,
        isHumans: true,
        armyId: newArmyId,
      };

      if (
           users.length > 1
        || battle.initialUnits[Battle.USER_SIDE][user.username].length > 1
      ) {
        // Если было несколько флотов, то все они возвращаются на свои домашние планеты
        flightData.returnPlanetId = Game.Planets.Collection.findOne({ name: user.planetName })._id;
      }

      FlightEvents.flyBack(flightData);
    }
  });
};

const wreakUnits = function(battle, users) {
  users.forEach((user) => {
    Game.Wrecks.addUnits({
      units: battle.getUsersKilledUnits(user.username),
      userId: user._id,
    });
  })
};

export default Space.jobs.processJobs(
  Lib.EVENT_TYPE,
  {
    concurrency: Config.JOBS.concurrency,
    payload: Config.JOBS.payload,
    pollInterval: Config.JOBS.pollInterval,
    prefetch: Config.JOBS.prefetch,
  },
  (job, cb) => {
    const data = job.data;
    const { battleId, planetId } = data;

    let planet = null;
    if (planetId) {
      planet = Game.Planets.Collection.findOne({ _id: planetId });
    }

    const battle = Battle.fromDB(battleId);

    const roundResult = battle.performRound();

    if (battle.status === Battle.Status.finish) {
      const isUserVictory = (Battle.USER_SIDE in roundResult.left);

      const users = Meteor.users.find({ username: { $in: battle.userNames } }).fetch();

      wreakUnits(battle, users);

      const options = { battle, roundResult, users, planet, data };

      if (isUserVictory) {
        humansWin(options);
      } else {
        reptilesWin(options);
      }

      if (planet) {
        Game.Planets.update(planet);
      }

      job.done();
    } else {
      job.done();

      job.rerun({
        wait: battleDelay({
          userArmy: roundResult.left[Battle.USER_SIDE],
          enemyArmy: roundResult.left[Battle.ENEMY_SIDE],
        }),
      });
    }

    cb();
  },
);
