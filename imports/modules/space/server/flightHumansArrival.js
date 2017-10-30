import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import createGroup from '/moduls/battle/lib/imports/createGroup';
import Battle from '/moduls/battle/server/battle';

import Flight from './flight';

import TriggerAttack from './triggerAttack';
import Config from './config';

import BattleEvents from './battle';
import Utils from '../lib/utils';

const completeOnPlanet = function(data, userId) {
  const planet = Game.Planets.getOne(data.targetId, userId);

  let userArmy = null;
  let enemyArmy = null;

  if (planet.mission) {
    const enemyFleet = Game.Planets.getFleetUnits(planet._id, userId);
    enemyArmy = { reptiles: { fleet: enemyFleet } };

    const userFleet = Flight.getFleetUnits(data);
    userArmy = { army: { fleet: userFleet } };

    const username = Meteor.users.findOne({
      _id: userId,
    }, {
      fields: { username: 1 },
    }).username;
    const userGroup = createGroup(userArmy);

    const jobRaw = BattleEvents.findByPlanetId(planet._id);

    if (jobRaw) {
      const battleId = jobRaw.data.battleId;

      Battle.addGroup(battleId, Battle.USER_SIDE, username, userGroup);
    } else {
      const enemyGroup = createGroup(enemyArmy);

      const options = {
        missionType: planet.mission.type,
        missionLevel: planet.mission.level,
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

    Game.Unit.removeArmy(data.armyId, userId);
  } else {
    if (!planet.isDiscovered) {
      Game.Planets.discover(planet._id, userId);
    }

    if (data.isOneway) {
      if (planet.isHome || planet.armyId) {
        // merge army
        const destArmyId = (planet.isHome)
          ? Game.Unit.getHomeArmy(userId)._id
          : planet.armyId;
        Game.Unit.mergeArmy(data.armyId, destArmyId, userId);
      } else {
        // move army
        Game.Unit.moveArmy(data.armyId, Game.Unit.location.PLANET, userId);
        planet.armyId = data.armyId;
        Game.Planets.update(planet);

        // add reptiles attack trigger
        TriggerAttack.add({
          targetPlanet: planet._id,
        }, Config.TRIGGER_ATTACK_DELAY, userId);
      }
    } else {
      Flight.toPlanet({
        ...data,
        isOneway: true,
        isBack: true,
        startPosition: data.targetPosition,
        startPlanetId: data.targetId,
        targetPosition: data.startPosition,
        targetId: data.startPlanetId,
      }, userId);
    }
  }
};

const completeOnShip = function(data, userId) {
  const targetShip = Flight.getOne(data.targetId);
  if (targetShip) {
    const job = Flight.jobs.getJob(targetShip._id);
    job.done();

    // Create battle
    const enemyFleet = Flight.getFleetUnits(targetShip.data);
    const enemyArmy = { reptiles: { fleet: enemyFleet } };
    const enemyGroup = createGroup(enemyArmy);

    const username = Meteor.users.findOne({
      _id: userId,
    }, {
      fields: { username: 1 },
    }).username;
    const userFleet = Flight.getFleetUnits(data);
    const userArmy = { army: { fleet: userFleet } };
    const userGroup = createGroup(userArmy);

    const options = {
      missionType: targetShip.data.mission.type,
      missionLevel: targetShip.data.mission.level,
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
        fleetId: data.targetId,
        battleId: battle.id,
      },
    });

    Game.Unit.removeArmy(data.armyId, userId);
  } else {
    const battleEvent = BattleEvents.findByFleetId(data.targetId);

    if (battleEvent) {
      // go to new battle position
      const flyTime = Utils.calcFlyTime(data.startPosition,
        battleEvent.data.targetPosition, data.engineLevel);

      Flight.toBattle({
        ...data,
        targetId: battleEvent._id,
        flyTime,
      }, userId);
    } else {
      // fly back
      Flight.toPlanet({
        ...data,
        isOneway: true,
        isBack: true,
        startPosition: data.targetPosition,
        targetPosition: data.startPosition,
        targetId: data.startPlanetId,
      }, userId);
    }
  }
};

const completeOnBattle = function(data, userId) {
  const battleId = data.targetId;

  const battle = Battle.fromDB(battleId);
  if (battle) {
    const username = Meteor.users.findOne({
      _id: userId,
    }, {
      fields: { username: 1 },
    }).username;
    const userFleet = Flight.getFleetUnits(data);
    const userArmy = { army: { fleet: userFleet } };
    const userGroup = createGroup(userArmy);
    Battle.addGroup(battleId, Battle.USER_SIDE, username, userGroup);

    Game.Unit.removeArmy(data.armyId, userId);
  } else {
    Flight.toPlanet({
      ...data,
      isOneway: true,
      isBack: true,
      startPosition: data.targetPosition,
      targetPosition: data.startPosition,
      targetId: data.startPlanetId,
    }, userId);
  }
};

export default function humansArrival(data) {
  const userId = data.userId;

  switch (data.targetType) {
    case Flight.TARGET.PLANET:
      completeOnPlanet(data, userId);
      break;

    case Flight.TARGET.SHIP:
      completeOnShip(data, userId);
      break;

    case Flight.TARGET.BATTLE:
      completeOnBattle(data, userId);
      break;

    default:
      throw new Meteor.Error('Ошибочный тип данных в событии');
  }
}
