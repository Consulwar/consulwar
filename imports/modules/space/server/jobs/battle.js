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
      // Пока бои в локальном пространстве - игрок только один,
      // хотя сами бои могут оперировать и несколькими игроками с одной стороны
      const username = battle.userNames[0];
      const user = Meteor.users.findOne({ username });

      if (Battle.USER_SIDE in roundResult.left) {
        if (planet) {
          planet.mission = null;
        }

        let targetId;
        if (battle.initialUnits[Battle.USER_SIDE][username].length === 1) {
          // battle without help
          targetId = data.startPlanetId;
        } else {
          targetId = Game.Planets.Collection.findOne({ name: user.planetName })._id;
        }

        const newArmyId = Game.Unit.createArmy(
          roundResult.left[Battle.USER_SIDE],
          Game.Unit.location.SHIP,
          user._id,
        );

        // return humans ship
        Flight.toPlanet({
          isHumans: true,
          isOneway: true,
          isBack: true,
          startPosition: data.targetId,
          startPlanetId: planetId,
          targetPosition: data.startPosition,
          targetId,
          flyTime: data.flyTime,
          engineLevel: data.engineLevel,
          armyId: newArmyId,
        }, user._id);
      } else if (data.isOneway) {
        if (!planet.mission) {
          // fill empty planet
          planet.mission = {
            type: data.mission.type === 'tradefleet' ? 'patrolfleet' : data.mission.type,
            level: data.mission.level,
            units: roundResult.left[Battle.ENEMY_SIDE].reptiles.fleet,
          };
        } else {
          // restore mission units
          planet.mission.units = null;
        }
      } else {
        const newArmyId = Game.Unit.createArmy(
          roundResult.left[Battle.ENEMY_SIDE],
          Game.Unit.location.SHIP,
          user._id,
        );

        // return reptiles ship
        Flight.toPlanet({
          isHumans: false,
          isOneway: true,
          isBack: true,
          startPosition: data.targetId,
          startPlanetId: planetId,
          targetPosition: data.startPosition,
          targetId: data.startPlanetId,
          flyTime: data.flyTime,
          engineLevel: data.engineLevel,
          armyId: newArmyId,
        }, user._id);
      }

      if (planet) {
        Game.Planets.update(planet);
      }
    } else {
      job.rerun({
        wait: battleDelay({
          userArmy: roundResult.left[Battle.USER_SIDE],
          enemyArmy: roundResult.left[Battle.ENEMY_SIDE],
        }),
      });
    }

    job.done();
    cb();
  },
);
