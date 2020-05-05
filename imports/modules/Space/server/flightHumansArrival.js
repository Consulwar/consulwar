import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';
import systemUser from '/moduls/user/server/systemUser';

import Space from '../lib/space';
import FlightEvents from './flightEvents';

import TriggerAttackEvents from './triggerAttackEvents';

import BattleEvents from './battleEvents';
import Utils from '../lib/utils';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';
import Hex from '../../MutualSpace/lib/Hex';

const completeOnPlanetMission = function(data, planet) {
  const { userId, username } = data;

  const enemyArmy = Game.Planets.getFleetUnits(planet._id, userId);

  const userArmy = FlightEvents.getFleetUnits(data);

  const userGroup = createGroup({ army: userArmy, userId });

  const battleEvent = BattleEvents.findByPlanetId(planet._id);

  if (battleEvent) {
    Battle.addGroup(battleEvent.data.battleId, Battle.USER_SIDE, username, userGroup);
  } else {
    BattleEvents.createBattleAndAdd({
      username,
      userArmy,
      userGroup,
      enemyArmy,
      mission: planet.mission,
      data: {
        ...data,
        planetId: planet._id,
      },
    });
  }

  Game.Unit.removeArmy(data.armyId, userId);
};

const completeOnPeacefulPlanet = function(data, planet) {
  const { userId, username } = data;
  const user = Meteor.users.findOne({ _id: userId });

  if (!planet.isDiscovered) {
    Game.Planets.discover(planet._id, user);
  }

  if (
    !(
      user.settings
      && user.settings.options
      && user.settings.options.disableAutoCollect
    )
    && planet.status === Game.Planets.STATUS.REPTILES
  ) {
    Game.Planets.awardArtefacts(planet, 1, userId);
    // eslint-disable-next-line no-param-reassign
    planet.status = Game.Planets.STATUS.NOBODY;
    Game.Planets.update(planet);
  }

  if (data.isOneway) {
    if (planet.armyId) {
      if (planet.armyUsername === username) {
        const destArmyId = (
          planet.isHome
            ? Game.Unit.getHomeFleetArmy({ userId })._id
            : planet.armyId
        );
        Game.Unit.mergeArmy(data.armyId, destArmyId, userId);
      } else {
        // if planet has army but it isn't our army
        // fly to home planet
        const homePlanet = Game.Planets.getBase(userId);

        const startPosition = {
          x: planet.x,
          y: planet.y,
        };

        const targetPosition = {
          x: homePlanet.x,
          y: homePlanet.y,
        };

        const startPositionWithOffset = { ...startPosition };
        const targetPositionWithOffset = { ...targetPosition };
        const homeHex = mutualSpaceCollection.findOne({ username });

        let center = new Hex(data.targetHex).center();
        startPositionWithOffset.x += center.x;
        startPositionWithOffset.y += center.y;

        center = new Hex(homeHex).center();
        targetPositionWithOffset.x += center.x;
        targetPositionWithOffset.y += center.y;

        const flyTime = Utils.calcFlyTime(
          startPositionWithOffset,
          targetPositionWithOffset,
          data.engineLevel,
        );
        
        if (planet.isHome && data.resourcesToTransfer) {
          Game.Resources.bought(data.resourcesToTransfer, planet.userId);
          delete data.resourcesToTransfer;
        }

        FlightEvents.add({
          ...data,
          startPosition,
          startPlanetId: planet._id,
          targetPosition,
          targetId: homePlanet._id,
          targetType: FlightEvents.TARGET.PLANET,
          flyTime,
          isOneway: true,
          isBack: true,
          hex: data.targetHex,
          targetHex: homeHex,
        });
      }
    } else {
      Game.Planets.update({
        ...planet,
        armyId: data.armyId,
        armyUsername: username,
      });
      Game.Unit.moveArmy(data.armyId, Game.Unit.location.PLANET);

      TriggerAttackEvents.add({ targetPlanet: planet._id, userId, username });
    }
  } else {
    FlightEvents.flyBack(data);
  }
};

const completeOnPlanet = function(data) {
  const planet = Game.Planets.getOne(data.targetId);
  if (planet.mission) {
    completeOnPlanetMission(data, planet);
  } else {
    const battleEvent = BattleEvents.findByPlanetId(planet._id);

    if (battleEvent) {
      const userArmy = FlightEvents.getFleetUnits(data);

      const userGroup = createGroup({ army: userArmy, userId: data.userId });

      Battle.addGroup(battleEvent.data.battleId, Battle.USER_SIDE, data.username, userGroup);
      Game.Unit.removeArmy(data.armyId, data.userId);
    } else {
      if (data.username === systemUser.username) {
        Game.Unit.removeArmy(data.armyId, data.userId);
        return;
      }
      completeOnPeacefulPlanet(data, planet);
    }
  }
};

const completeOnShip = function(data) {
  const targetShip = FlightEvents.getOne(data.targetId);

  if (targetShip) {
    const job = Space.jobs.getJob(targetShip._id);
    if (job) {
      job.cancel();
    }

    // Create battle
    const enemyArmy = FlightEvents.getFleetUnits(targetShip.data);

    const userArmy = FlightEvents.getFleetUnits(data);

    BattleEvents.createBattleAndAdd({
      username: data.username,
      userArmy,
      enemyArmy,
      mission: targetShip.data.mission,
      data: {
        ...data,
        fleetId: data.targetId,
        reptileData: targetShip.data,
      },
    });

    Game.Unit.removeArmy(data.armyId, data.userId);
  } else {
    const battleEvent = BattleEvents.findByFleetId(data.targetId);

    if (battleEvent) {
      // go to new battle position
      const startPosition = { ...data.targetPosition };
      const targetPosition = { ...battleEvent.data.targetPosition };

      const startPositionWithOffset = { ...startPosition };
      const targetPositionWithOffset = { ...targetPosition };

      if (data.hex) {
        let center = new Hex(battleEvent.data.targetHex).center();
        startPositionWithOffset.x += center.x;
        startPositionWithOffset.y += center.y;

        center = new Hex(battleEvent.data.targetHex).center();
        targetPositionWithOffset.x += center.x;
        targetPositionWithOffset.y += center.y;
      }

      const flyTime = Utils.calcFlyTime(
        startPositionWithOffset,
        targetPositionWithOffset,
        data.engineLevel,
      );

      FlightEvents.add({
        ...data,
        startPosition,
        targetPosition,
        targetId: battleEvent.data.battleId,
        targetType: FlightEvents.TARGET.BATTLE,
        flyTime,
      });
    } else {
      // fly back
      FlightEvents.flyBack(data);
    }
  }
};

const completeOnBattle = function(data) {
  const battleEvent = BattleEvents.findByBattleId(data.targetId);

  if (battleEvent) {
    const userArmy = FlightEvents.getFleetUnits(data);
    const userGroup = createGroup({ army: userArmy, userId: data.userId });
    Battle.addGroup(data.targetId, Battle.USER_SIDE, data.username, userGroup);

    Game.Unit.removeArmy(data.armyId, data.userId);
  } else {
    // fly back
    FlightEvents.flyBack(data);
  }
};

export default function humansArrival(data) {
  switch (data.targetType) {
    case FlightEvents.TARGET.PLANET:
      completeOnPlanet(data);
      break;

    case FlightEvents.TARGET.SHIP:
      completeOnShip(data);
      break;

    case FlightEvents.TARGET.BATTLE:
      completeOnBattle(data);
      break;

    default:
      throw new Meteor.Error('Ошибочный тип данных в событии');
  }
}
