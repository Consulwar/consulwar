import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

import Flight from './flight';

import BattleEvents from './battle';

const flyBack = function(data) {
  Flight.toPlanet({
    ...data,
    isOneway: true,
    isBack: true,
    startPosition: data.targetPosition,
    targetPosition: data.startPosition,
    targetId: data.startPlanetId,
  }, data.userId);
};

export default function reptileArrival(data) {
  const { userId } = data;

  const planet = Game.Planets.getOne(data.targetId, userId);

  if (!planet.mission) {
    if (planet.armyId || planet.isHome) {
      const enemyFleet = Flight.getFleetUnits(data);
      const enemyArmy = { reptiles: { fleet: enemyFleet } };
      const enemyGroup = createGroup(enemyArmy);

      const jobRaw = BattleEvents.findByPlanetId(planet._id);

      if (jobRaw) {
        const battleId = jobRaw.data.battleId;

        Battle.addGroup(battleId, Battle.USER_SIDE, 'ai', enemyGroup);
      } else {
        let userArmy;

        if (planet.isHome) {
          const homeArmy = Game.Unit.getHomeArmy(userId);
          if (homeArmy && homeArmy.units && homeArmy.units.army && homeArmy.units.army.ground) {
            Game.Unit.updateArmy(homeArmy._id, homeArmy.units.army.ground, userId);

            delete homeArmy.units.army.ground;
          }

          userArmy = homeArmy.units;
        } else {
          const planetArmy = Game.Unit.getArmy(planet.armyId, userId);
          if (planetArmy) {
            userArmy = planetArmy.units;
          }

          Game.Unit.removeArmy(planet.armyId, userId);
          planet.armyId = null;
        }

        const username = Meteor.users.findOne({
          _id: userId,
        }, {
          fields: { username: 1 },
        }).username;
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
          userArmy,
          enemyArmy,
          data: {
            ...data,
            planetId: planet._id,
            battleId: battle.id,
          },
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
