import { Meteor } from 'meteor/meteor';
import Game from '/moduls/game/lib/main.game';
import { canSendFleet } from '../lib/events';
import calcAttackOptions from '../lib/calcAttackOptions';
import { calcFlyTime } from '../lib/utils';
import { getOne, Target } from '../lib/flight';
import Flight from './flight';
import TriggerAttack from './triggerAttack';
import { TRIGGER_ATTACK_DELAY, ENEMY_RESPAWN_PERIOD } from './config';
import { findByBattleId } from '../lib/battle';

Meteor.methods({
  'space.attackReptileFleet'(baseId, targetId, units, targetX, targetY) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'space.attackReptileFleet');

    if (!Game.User.haveVerifiedEmail()) {
      throw new Meteor.Error('Сперва нужно верифицировать Email');
    }

    if (!canSendFleet()) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    const basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      throw new Meteor.Error('Плаента не существует');
    }

    const enemyShip = getOne(targetId);
    if (!enemyShip) {
      throw new Meteor.Error('Корабль не существует');
    }

    if (!enemyShip.data || !enemyShip.data.mission) {
      throw new Meteor.Error('Данные корабля испорчены');
    }

    if (enemyShip.data.isHumans) {
      throw new Meteor.Error('Нельзя перехватить свой корабль');
    }

    const engineLevel = Game.Planets.getEngineLevel();

    const startPosition = {
      x: basePlanet.x,
      y: basePlanet.y,
    };

    const targetPosition = {
      x: targetX,
      y: targetY,
    };

    // check time
    const timeCurrent = Game.getCurrentTime() * 1000;
    const timeLeft = enemyShip.after - timeCurrent;

    const attackOptions = calcAttackOptions(
      basePlanet,
      engineLevel,
      enemyShip,
      timeCurrent,
    );

    if (!attackOptions || attackOptions.time >= timeLeft) {
      throw new Meteor.Error('Невозможно перехватить');
    }

    const timeAttack = attackOptions.time;

    // check and slice units
    let sourceArmyId = basePlanet.armyId;
    if (basePlanet.isHome) {
      sourceArmyId = Game.Unit.getHomeArmy()._id;
    }

    const destUnits = { army: { fleet: units } };
    const newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

    // update base planet
    const baseArmy = Game.Unit.getArmy(basePlanet.armyId);
    if (!baseArmy) {
      basePlanet.armyId = null;
    }

    Game.Planets.update(basePlanet);

    Flight.toShip({
      startPosition,
      startPlanetId: basePlanet._id,
      targetPosition,
      targetId: enemyShip._id,
      startTime: timeCurrent,
      flyTime: timeAttack,
      isHumans: true,
      isOneway: false,
      engineLevel,
      mission: null,
      armyId: newArmyId,
    });

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'cosmos.fleets.sent': 1,
    });
  },

  'space.sendFleet'(baseId, targetType, targetId, units, isOneway) {
    const user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'space.sendFleet');

    if (!canSendFleet()) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    let target;

    if (targetType === Target.PLANET) {
      if (baseId === targetId) {
        throw new Meteor.Error('Стартовая планета и конечная должны быть разными');
      }

      const targetPlanet = Game.Planets.getOne(targetId);
      if (!targetPlanet) {
        throw new Meteor.Error('Не найдена конечная планета');
      }

      target = targetPlanet;
    } else if (targetType === Target.BATTLE) {
      const battleEvent = findByBattleId(targetId);

      if (!battleEvent) {
        throw new Meteor.Error('Не найдено сражение');
      }

      target = battleEvent;
    } else {
      throw new Meteor.Error('Неверный параметр типа цели.');
    }

    const basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      throw new Meteor.Error('Не найдена стартовая планета');
    }

    // slice units
    let sourceArmyId = basePlanet.armyId;
    if (basePlanet.isHome) {
      sourceArmyId = Game.Unit.getHomeArmy()._id;
    }

    const destUnits = { army: { fleet: units } };
    const newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

    // update base planet
    const baseArmy = Game.Unit.getArmy(basePlanet.armyId);
    if (!baseArmy) {
      basePlanet.armyId = null;
    }
    basePlanet.timeRespawn = Game.getCurrentTime() + ENEMY_RESPAWN_PERIOD;
    Game.Planets.update(basePlanet);

    const startPosition = {
      x: basePlanet.x,
      y: basePlanet.y,
    };

    const targetPosition = {
      x: target.x,
      y: target.y,
    };

    const engineLevel = Game.Planets.getEngineLevel();

    const data = {
      isHumans: true,
      startPosition,
      startPlanetId: basePlanet._id,
      targetPosition,
      targetId: target._id,
      flyTime: calcFlyTime(startPosition, targetPosition, engineLevel),
      engineLevel,
      isOneway,
      armyId: newArmyId,
    };

    if (targetType === Target.PLANET) {
      Flight.toPlanet(data);
    } else {
      Flight.toBattle(data);
    }

    // if planet is colony
    if (!basePlanet.isHome && basePlanet.armyId) {
      // add reptiles attack trigger
      TriggerAttack.add({
        targetPlanet: basePlanet._id,
      }, TRIGGER_ATTACK_DELAY, user._id);
    }

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'cosmos.fleets.sent': 1,
    });
  },
});
