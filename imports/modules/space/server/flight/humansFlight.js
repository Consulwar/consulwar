import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';

import Flight from '../flight';
import { getFleetUnits, Target, getOne } from '../../lib/flight';

import TriggerAttack from '../triggerAttack';
import { TRIGGER_ATTACK_DELAY } from '../config';

import BattleEvents from '../battle';

import createGroup from '../../../../../moduls/battle/lib/imports/createGroup';
import Battle from '../../../../../moduls/battle/server/battle';

function completeOnPlanet(data, userId) {
  const planet = Game.Planets.getOne(data.targetId, userId);

  let userArmy = null;
  let enemyArmy = null;

  if (planet.mission) {
    const enemyFleet = Game.Planets.getFleetUnits(planet._id, userId);
    enemyArmy = { reptiles: { fleet: enemyFleet } };

    const userFleet = getFleetUnits(data);
    userArmy = { army: { fleet: userFleet } };

    const username = Meteor.users.findOne({ _id: userId }).username;
    const userGroup = createGroup(userArmy);

    const jobRaw = BattleEvents.findByPlanetID(planet._id);

    if (jobRaw) {
      const battleID = jobRaw.data.battleID;

      Battle.addGroup(battleID, Battle.USER_SIDE, username, userGroup);
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
        ...data,
        planetID: planet._id,
        battleID: battle.id,
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
        }, TRIGGER_ATTACK_DELAY, userId);
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
}

function completeOnShip(data, userId) {
  const targetShip = getOne(data.targetId, userId);
  if (targetShip) {
    targetShip.done();

    // Create battle
    const enemyFleet = getFleetUnits(targetShip.data);
    const enemyArmy = { reptiles: { fleet: enemyFleet } };
    const enemyGroup = createGroup(enemyArmy);

    const username = Meteor.users.findOne({ _id: userId }).username;
    const userFleet = getFleetUnits(data);
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
      ...data,
      fleetID: data.targetId,
      battleID: battle.id,
    });

    Game.Unit.removeArmy(data.armyId, userId);
  } else {
    const battleID = BattleEvents.findByFleetID(data.targetId);

    if (battleID) {
      const username = Meteor.users.findOne({ _id: userId }).username;
      const userFleet = getFleetUnits(data);
      const userArmy = { army: { fleet: userFleet } };
      const userGroup = createGroup(userArmy);
      Battle.addGroup(battleID, Battle.USER_SIDE, username, userGroup);

      Game.Unit.removeArmy(data.armyId, userId);
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
}

function completeOnBattle(data, userId) {
  const battleID = data.targetId;

  const battle = Battle.fromDB(battleID);
  if (battle) {
    const username = Meteor.users.findOne({ _id: userId }).username;
    const userFleet = getFleetUnits(data);
    const userArmy = { army: { fleet: userFleet } };
    const userGroup = createGroup(userArmy);
    Battle.addGroup(battleID, Battle.USER_SIDE, username, userGroup);

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
}

export default function humansFlight(data) {
  const userId = data.user_id;

  switch (data.targetType) {
    case Target.PLANET:
      completeOnPlanet(data, userId);
      break;

    case Target.SHIP:
      completeOnShip(data, userId);
      break;

    case Target.BATTLE:
      completeOnBattle(data, userId);
      break;

    default:
      throw new Meteor.Error('Ошибочный тип данных в событии');
  }
}
