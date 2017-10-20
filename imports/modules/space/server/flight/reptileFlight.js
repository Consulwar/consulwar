import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import Flight from '../flight';
import { getFleetUnits } from '../../lib/flight';

import createGroup from '../../../../../moduls/battle/lib/imports/createGroup';
import Battle from '../../../../../moduls/battle/server/battle';

import BattleEvents from '../battle';

const flyBack = function (data) {
  Flight.toPlanet({
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: data.targetPosition,
    targetPosition: data.startPosition,
    targetId: data.startPlanetId,
  }, data.user_id);
};

export default function reptileFlight(data) {
  const { user_id } = data;

  const planet = Game.Planets.getOne(data.targetId, user_id);

  if (!planet.mission) {
    if (planet.armyId || planet.isHome) {
      const enemyFleet = getFleetUnits(data);
      const enemyArmy = { reptiles: { fleet: enemyFleet } };
      const enemyGroup = createGroup(enemyArmy);

      const jobRaw = BattleEvents.findByPlanetID(planet._id);

      if (jobRaw) {
        const battleID = jobRaw.data.battleID;

        Battle.addGroup(battleID, Battle.USER_SIDE, 'ai', enemyGroup);
      } else {
        let userArmy;

        if (planet.isHome) {
          const homeArmy = Game.Unit.getHomeArmy(user_id);
          if (homeArmy && homeArmy.units && homeArmy.units.army && homeArmy.units.army.ground) {
            Game.Unit.updateArmy(homeArmy._id, homeArmy.units.army.ground);

            delete homeArmy.units.army.ground;
          }

          userArmy = homeArmy.units;
        } else {
          const planetArmy = Game.Unit.getArmy(planet.armyId, user_id);
          if (planetArmy) {
            userArmy = planetArmy.units;
          }

          Game.Unit.removeArmy(planet.armyId, user_id);
          planet.armyId = null;
        }

        const username = Meteor.users.findOne({ _id: user_id }).username;
        const userGroup = createGroup(userArmy);

        const options = {
          missionType: data.mission.type,
          missionLevel: data.mission.level,
        };

        const battle = Battle.create(options,
          {
            [username]: [userGroup],
          }, {
            ai: [enemyGroup],
          },
        );

        BattleEvents.add({
          ...data,
          planetID: planet._id,
          battleID: battle.id,
        });
      }
    } else {
      planet.mission = {
        type: data.mission.type === 'tradefleet' ? 'patrolfleet' : data.mission.type,
        level: data.mission.level,
        units: data.mission.units,
      };

      if (!data.isOneway) {
        flyBack(data);
      }
    }
  } else if (!planet.isHome) {
    // restore mission units
    planet.mission.units = null;

    if (!data.isOneway) {
      flyBack(data);
    }
  }

  Game.Planets.update(planet);
}
