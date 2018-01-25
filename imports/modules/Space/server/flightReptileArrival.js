import Game from '/moduls/game/lib/main.game';

import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

import FlightEvents from './flightEvents';

import BattleEvents from './battleEvents';
import Reptiles from './reptiles';

export default function reptileArrival(data) {
  const planet = Game.Planets.getOne(data.targetId);

  const job = BattleEvents.findByPlanetId(planet._id);

  if (job) {
    const enemyFleet = FlightEvents.getFleetUnits(data);
    const enemyArmy = { reptiles: { fleet: enemyFleet } };
    const enemyGroup = createGroup({ army: enemyArmy });

    const battleId = job.data.battleId;
    Battle.addGroup(battleId, Battle.ENEMY_SIDE, Battle.aiName, enemyGroup);
  } else if (planet.mission) {
    if (!data.isOneway) {
      FlightEvents.flyBack(data);
    } else {
      // restore mission units
      planet.mission.units = null;
    }
  } else if (planet.armyId || planet.isHome) {
    const username = planet.armyUsername;
    const userId = Game.Unit.getArmy({ id: planet.armyId }).user_id;

    const enemyFleet = FlightEvents.getFleetUnits(data);
    const enemyArmy = { reptiles: { fleet: enemyFleet } };
    const enemyGroup = createGroup({ army: enemyArmy, userId });

    let userArmy;

    if (planet.isHome) {
      const homeArmy = Game.Unit.getHomeFleetArmy({ userId });
      if (homeArmy && homeArmy.units && homeArmy.units.army) {
        if (homeArmy.units.army.ground) {
          Game.Unit.updateArmy(homeArmy._id, homeArmy.units.army.ground, userId);
          delete homeArmy.units.army.ground;
        } else {
          Game.Unit.removeArmy(homeArmy._id, userId);
        }
      } else {
        Reptiles.stealUserResources({
          enemyArmy,
          userId,
        });

        FlightEvents.flyBack(data);
        return;
      }

      userArmy = homeArmy.units;
    } else {
      const planetArmy = Game.Unit.getArmy({ id: planet.armyId });
      if (planetArmy) {
        userArmy = planetArmy.units;
      }

      Game.Unit.removeArmy(planet.armyId, userId);
      planet.armyId = null;
      planet.armyUsername = null;
    }

    BattleEvents.createBattleAndAdd({
      username,
      userArmy,
      enemyArmy,
      enemyGroup,
      mission: data.mission,
      data: {
        ...data,
        planetId: planet._id,
      },
    });
  } else {
    if (planet.status === Game.Planets.STATUS.HUMANS) {
      planet.status = Game.Planets.STATUS.NOBODY;
      planet.minerUsername = null;
    }

    if (!data.isOneway) {
      FlightEvents.flyBack(data);
    } else {
      planet.mission = {
        type: data.mission.type === 'tradefleet' ? 'patrolfleet' : data.mission.type,
        level: data.mission.level,
        units: data.mission.units,
      };
    }
  }

  Game.Planets.update(planet);
}