/* eslint-disable no-param-reassign */
import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import Battle from '/moduls/battle/server/battle';
import BattleLib from '/moduls/battle/lib/imports/battle';
import User from '/imports/modules/User/lib/User';
import systemUsername from '/moduls/user/lib/systemUsername';

import Config from '../config';
import Space from '../../lib/space';
import Lib from '../../lib/battle';
import FlightEvents from '../flightEvents';
import battleDelay from '../battleDelay';
import Reptiles from '../reptiles';
import Utils from '../../lib/utils';
import spawnEnemy from '../enemySpawner';
import mutualSpaceCollection from '../../../MutualSpace/lib/collection';

const reptilesWin = function({
  battle,
  roundResult,
  planet,
  data,
}) {
  if (planet && !planet.isHome && planet.status === Game.Planets.STATUS.HUMANS) {
    planet.status = Game.Planets.STATUS.NOBODY;
    planet.minerUsername = null;
  }

  const army = roundResult.left[Battle.ENEMY_SIDE];

  if (planet) {
    if (data.isOneway && !data.isHumans && !planet.isHome) {
      // Остаются на планете
      planet.armyId = null;
      planet.armyUsername = null;

      if (planet.mission && data.mission.type !== 'krampus') {
        // restore mission units
        planet.mission.units = null;
      } else {
        // fill empty planet
        planet.mission = {
          type: data.mission.type === 'tradefleet' ? 'patrolfleet' : data.mission.type,
          level: data.mission.level,
          units: army,
        };
      }
    } else if (!data.isOneway && !data.isHumans) {
      // Возвращаются

      // army check needed when player lost last ship due to mutual battle and
      // all reptiles were destroyed
      if (planet.isHome && army) {
        Reptiles.stealUserResources({
          enemyArmy: army,
          userId: data.userId,
          battle,
        });
      } else if (planet.mission) {
        // restore mission units
        planet.mission.units = null;
      }

      const backData = data.reptileData || data;
      backData.mission.units = army;

      FlightEvents.flyBack(backData);
    }
  } else {
    // Продолжают прерванный боем полет
    const { reptileData } = data;
    const { targetPosition } = reptileData;
    const startPosition = data.targetPosition;

    FlightEvents.add({
      ...reptileData,
      startPosition,
      flyTime: Utils.calcFlyTime(startPosition, targetPosition, 1),
    });
  }
};

const humansWin = function({
  battle,
  roundResult,
  users,
  planet,
  data,
}) {
  const initialUser = User.getByUsername({ username: battle.userNames[0] });
  if (planet) {
    planet.mission = null;
    if (!planet.isDiscovered) {
      const user = User.getById({ userId: planet.userId });
      Game.Planets.discover(planet._id, user);
    }

    if (
      initialUser.username !== systemUsername
      && !(
        initialUser.settings
        && initialUser.settings.options
        && initialUser.settings.options.disableAutoCollect
      )
      && planet.status === Game.Planets.STATUS.REPTILES
      && BattleLib.isBattle1x1(battle)
    ) {
      Game.Planets.awardArtefacts(planet, 1, data.userId);
      planet.status = Game.Planets.STATUS.NOBODY;
    }
  }

  users.forEach((user) => {
    if (user.username === systemUsername) {
      return;
    }

    const army = roundResult.leftByUsername[user.username];

    if (!army) {
      return;
    }

    const newArmyId = Game.Unit.createArmy(
      army,
      Game.Unit.location.SHIP,
      user._id,
    );

    if (
      planet && user._id === initialUser._id && (
        (data.isHumans && data.isOneway)
        || !data.isHumans
      )
    ) {
      // Остаемся на планете
      if (planet.armyId) {
        // merge army
        const destArmyId = (
          planet.isHome
            ? Game.Unit.getHomeFleetArmy({ userId: user._id })._id
            : planet.armyId
        );
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
        mission: null,
        targetType: FlightEvents.TARGET.PLANET,
        isHumans: true,
        armyId: newArmyId,
        userId: user._id,
        username: user.username,
      };

      if (
        users.length > 1
        || battle.initialUnits[Battle.USER_SIDE][user.username].length > 1
      ) {
        // Если было несколько флотов игроков, то все они возвращаются на свои домашние планеты
        flightData.returnPlanetId = Game.Planets.getBase(user._id)._id;
        flightData.engineLevel = Game.Planets.getEngineLevel(user);
      }

      FlightEvents.flyBack(flightData);
    }
  });

  if (
    Meteor.settings.space.enemySpawner.enabled
    && initialUser.username !== systemUsername
    && !battle.options.noReward
    && battle.options.missionType
  ) {
    let targetUsername;
    if (!mutualSpaceCollection.findOne({
      username: initialUser.username,
    })) {
      return;
    }
    const userLevel = Game.User.getLevel(initialUser.rating);
    const targetRating = Game.User.levels[userLevel].rating;

    if (
      initialUser.enemy
      && initialUser.enemy.expire > Game.getCurrentServerTime()
      && User.getByUsername({ username: initialUser.enemy.username }).rating >= targetRating
    ) {
      targetUsername = initialUser.enemy.username;
    } else if (Meteor.settings.space.enemySpawner.enabledAuto) {
      if (Game.Random.random() > Meteor.settings.space.enemySpawner.autoChance) {
        return;
      }

      while (!targetUsername) {
        const [potentialUser] = Meteor.users.aggregate([
          { $match: { rating: { $gte: targetRating } } },
          { $match: { username: { $nin: [initialUser.username, systemUsername] } } },
          { $sample: { size: 1 } },
        ]);
        const targetHex = mutualSpaceCollection.findOne({
          username: potentialUser.username,
        });
        if (targetHex) {
          targetUsername = potentialUser.username;
        }
      }
    }

    spawnEnemy({
      missionType: battle.options.missionType,
      missionLevel: battle.options.missionLevel,
      targetUsername,
      senderUsername: initialUser.username,
    });
  }
};

const wreakUnits = function(battle, users) {
  users.forEach((user) => {
    if (user.username === systemUsername) {
      return;
    }
    Game.Wrecks.addUnits({
      units: battle.getUsersKilledUnits(user.username),
      userId: user._id,
    });
  });
};

if (Meteor.settings.last) {
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
        const { data } = job;
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

          const options = {
            battle,
            roundResult,
            users,
            planet,
            data,
          };

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
      } catch (err) {
        job.fail(err.stack);
        cb(err.stack);
      }
    },
  );
}
