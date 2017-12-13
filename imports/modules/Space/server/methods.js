import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Game from '/moduls/game/lib/main.game';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import Space from '../lib/space';
import calcAttackOptions from '../lib/calcAttackOptions';
import Utils from '../lib/utils';
import FlightEvents from './flightEvents';
import TriggerAttackEvents from './triggerAttackEvents';
import Config from './config';
import BattleEvents from './battleEvents';

Meteor.methods({
  'space.attackReptileFleet'(baseId, targetId, units, targetX, targetY) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.attackReptileFleet', user });

    check(baseId, String);
    check(targetId, String);
    check(units, Object);
    check(targetX, Number);
    check(targetY, Number);

    if (!Game.User.haveVerifiedEmail()) {
      throw new Meteor.Error('Сперва нужно верифицировать Email');
    }

    if (!Space.canSendFleet()) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    const basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      throw new Meteor.Error('Плаента не существует');
    }

    const enemyShip = FlightEvents.getOne(targetId);
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

    const attackOptions = calcAttackOptions({
      attackerPlanet: basePlanet,
      attackerEngineLevel: engineLevel,
      targetShip: enemyShip,
      timeCurrent,
    });

    if (!attackOptions || attackOptions.time >= timeLeft) {
      throw new Meteor.Error('Невозможно перехватить');
    }

    const timeAttack = attackOptions.time;

    // check and slice units
    let sourceArmyId = basePlanet.armyId;
    if (basePlanet.isHome) {
      sourceArmyId = Game.Unit.getHomeFleetArmy()._id;
    }

    const destUnits = { army: { fleet: units } };
    const newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

    // update base planet
    const baseArmy = Game.Unit.getArmy({ id: basePlanet.armyId });
    if (!baseArmy) {
      basePlanet.armyId = null;
    }

    Game.Planets.update(basePlanet);

    FlightEvents.add({
      targetType: FlightEvents.TARGET.SHIP,
      userId: user._id,
      username: user.username,
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
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.sendFleet', user });

    check(baseId, String);
    check(targetType, Number);
    check(targetId, String);
    check(units, Object);
    check(isOneway, Boolean);

    if (!Space.canSendFleet()) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    let target;

    if (targetType === FlightEvents.TARGET.PLANET) {
      if (baseId === targetId) {
        throw new Meteor.Error('Стартовая планета и конечная должны быть разными');
      }

      const targetPlanet = Game.Planets.getOne(targetId);
      if (!targetPlanet) {
        throw new Meteor.Error('Не найдена конечная планета');
      }

      target = targetPlanet;
    } else if (targetType === FlightEvents.TARGET.BATTLE) {
      const battleEvent = BattleEvents.findByBattleId(targetId);

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
      sourceArmyId = Game.Unit.getHomeFleetArmy()._id;
    }

    const destUnits = { army: { fleet: units } };
    const newArmyId = Game.Unit.sliceArmy(sourceArmyId, destUnits, Game.Unit.location.SHIP);

    // update base planet
    const baseArmy = Game.Unit.getArmy({ id: basePlanet.armyId });
    if (!baseArmy) {
      basePlanet.armyId = null;
    }
    basePlanet.timeRespawn = Game.getCurrentTime() + Config.ENEMY_RESPAWN_PERIOD;
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
      userId: user._id,
      username: user.username,
      targetType,
      isHumans: true,
      startPosition,
      startPlanetId: basePlanet._id,
      targetPosition,
      targetId: target._id,
      flyTime: Utils.calcFlyTime(startPosition, targetPosition, engineLevel),
      engineLevel,
      isOneway,
      armyId: newArmyId,
    };

    FlightEvents.add(data);

    // if planet is colony
    if (!basePlanet.isHome && basePlanet.armyId) {
      // add reptiles attack trigger
      TriggerAttackEvents.add({
        targetPlanet: basePlanet._id,
        userId: user._id,
      });
    }

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'cosmos.fleets.sent': 1,
    });
  },

  'space.moveFromSpaceToHangar'() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.moveToHangar', user });

    if (!Space.canMoveFromSpaceToHangar(user)) {
      throw new Meteor.Error('Перемещение флота недоступно.');
    }

    const hangarArmy = Game.Unit.getHangarArmy({ userId: user._id });
    const homeFleetArmy = Game.Unit.getHomeFleetArmy({ userId: user._id });

    Game.Unit.mergeArmy(homeFleetArmy._id, hangarArmy._id, user._id);

    // update time
    Meteor.users.update({
      _id: user._id,
    }, {
      $set: {
        lastMoveToHangar: new Date(),
      },
    });
  },

  'space.moveFromHangarToSpace'(army) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.moveFromHangarToSpace', user });

    check(army, Object);

    const hangarArmy = Game.Unit.getHangarArmy({ userId: user._id });

    const destUnits = { army };
    const newArmyId = Game.Unit.sliceArmy(hangarArmy._id, destUnits, Game.Unit.location.PLANET);

    const homeFleetArmy = Game.Unit.getHomeFleetArmy({ userId: user._id });

    Game.Unit.mergeArmy(newArmyId, homeFleetArmy._id, user._id);
  },
});

