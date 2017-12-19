import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

import Space from '../lib/space';
import FlightEvents from './flightEvents';

import TriggerAttackEvents from './triggerAttackEvents';

import BattleEvents from './battleEvents';
import Utils from '../lib/utils';

const completeOnPlanetMission = function(data) {
  const { planet, userId, username } = data;

  const enemyArmy = {
    reptiles: {
      fleet: Game.Planets.getFleetUnits(planet._id, userId),
    },
  };

  const userArmy = {
    army: {
      fleet: FlightEvents.getFleetUnits(data),
    },
  };

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

const completeOnEmptySelfPlanet = function(data) {
  const { planet, userId } = data;

  if (planet.isHome || planet.armyId) {
    // merge army
    const destArmyId = (planet.isHome)
      ? Game.Unit.getHomeFleetArmy({ userId })._id
      : planet.armyId;
    Game.Unit.mergeArmy(data.armyId, destArmyId, userId);
  } else {
    // move army
    Game.Planets.update({
      ...planet,
      armyId: data.armyId,
      armyUsername: data.username,
    });
    Game.Unit.moveArmy(data.armyId, Game.Unit.location.PLANET);

    // add reptiles attack trigger
    TriggerAttackEvents.add({
      targetPlanet: planet._id,
      userId,
    });
  }
};

const completeOnEmptyOtherPlanet = function(data) {
  const { planet } = data;

  if (planet.armyId) {
    FlightEvents.flyBack(data);
  } else {
    // move army
    Game.Planets.update({
      ...planet,
      armyId: data.armyId,
      armyUsername: data.username,
    });
    Game.Unit.moveArmy(data.armyId, Game.Unit.location.PLANET);
  }
};

const completeOnEmptyPlanet = function(data) {
  const { planet, userId } = data;
  const user = Meteor.users.findOne({ _id: userId });

  if (!planet.isDiscovered) {
    Game.Planets.discover(planet._id, user);
  }

  if (data.isOneway) {
    if (planet.username === data.username) {
      completeOnEmptySelfPlanet(data);
    } else {
      completeOnEmptyOtherPlanet(data);
    }
  } else {
    FlightEvents.flyBack(data);
  }
};

const completeOnPlanet = function(data) {
  const planet = Game.Planets.getOne(data.targetId);
  if (planet.mission) {
    completeOnPlanetMission({ ...data, planet });
  } else {
    const battleEvent = BattleEvents.findByPlanetId(planet._id);

    if (battleEvent) {
      const userArmy = {
        army: {
          fleet: FlightEvents.getFleetUnits(data),
        },
      };

      const userGroup = createGroup({ army: userArmy, userId: data.userId });

      Battle.addGroup(battleEvent.data.battleId, Battle.USER_SIDE, data.username, userGroup);
    } else {
      completeOnEmptyPlanet({ ...data, planet });
    }
  }
};

const completeOnShip = function(data) {
  const targetShip = FlightEvents.getOne(data.targetId);

  if (targetShip) {
    const job = Space.jobs.getJob(targetShip._id);
    job.cancel();

    // Create battle
    const enemyArmy = {
      reptiles: {
        fleet: FlightEvents.getFleetUnits(targetShip.data),
      },
    };

    const userArmy = {
      army: {
        fleet: FlightEvents.getFleetUnits(data),
      },
    };

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
      const flyTime = Utils.calcFlyTime(data.startPosition,
        battleEvent.data.targetPosition, data.engineLevel);

      FlightEvents.add({
        ...data,
        targetId: battleEvent._id,
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
  const battle = Battle.fromDB(data.battleId);

  if (battle) {
    const userArmy = {
      army: {
        fleet: FlightEvents.getFleetUnits(data),
      },
    };
    const userGroup = createGroup({ army: userArmy, userId: data.userId });
    Battle.addGroup(data.battleId, Battle.USER_SIDE, data.username, userGroup);

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
