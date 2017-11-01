import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import Battle from '/moduls/battle/server/battle';

import Config from '../config';
import Space from '../../lib/space';
import Lib from '../../lib/battle';
import Flight from '../flight';
import battleDelay from '../battleDelay';

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
      // Пока бои в локальном пространстве, игрок только один, хотя
      // сами бои могут оперировать и несколькими игроками с одной стороны
      const username = battle.userNames[0];
      const user = Meteor.users.findOne({ username });
      const isUserVictory = (Battle.USER_SIDE in roundResult.left);
      const army = roundResult.left[Battle[(isUserVictory ? 'USER_SIDE' : 'ENEMY_SIDE')]];

      if (planet && (data.isOneway || data.isHumans !== isUserVictory)) {
        // Победитель остается на планете
        const newArmyId = Game.Unit.createArmy(
          army,
          Game.Unit.location.SHIP,
          user._id,
        );

        if (isUserVictory) {
          planet.mission = null;
          if (planet.isHome || planet.armyId) {
            // merge army
            const destArmyId = (planet.isHome)
              ? Game.Unit.getHomeArmy(user._id)._id
              : planet.armyId;
            Game.Unit.mergeArmy(newArmyId, destArmyId, user._id);
          } else {
            // move army
            Game.Unit.moveArmy(newArmyId, Game.Unit.location.PLANET, user._id);
            planet.armyId = newArmyId;
          }
        } else {
          planet.status = Game.Planets.STATUS.NOBODY;
          planet.armyId = null;

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
        }
      } else {
        // Победитель возвращается
        let newArmyId = null;
        let targetId = data.returnPlanetId;

        if (isUserVictory) {
          newArmyId = Game.Unit.createArmy(
            army,
            Game.Unit.location.SHIP,
            user._id,
          );

          if (battle.initialUnits[Battle.USER_SIDE][username].length > 1) {
            // user battle with help
            targetId = Game.Planets.Collection.findOne({ name: user.planetName })._id;
          }
        }

        if (planet) {
          planet.mission = null;
          if (!isUserVictory && !planet.isHome) {
            planet.status = Game.Planets.STATUS.NOBODY;
          }
        }

        // return humans ship
        Flight.toPlanet({
          ...data,
          isHumans: isUserVictory,
          isOneway: true,
          isBack: true,
          startPosition: data.targetPosition,
          startPlanetId: planetId,
          targetPosition: data.returnDestination,
          targetId,
          armyId: newArmyId,
        }, user._id);
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
