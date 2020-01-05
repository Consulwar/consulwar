import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import Space from '../lib/space';
import calcAttackOptions from '../lib/calcAttackOptions';
import Utils from '../lib/utils';
import FlightEvents from './flightEvents';
import TriggerAttackEvents from './triggerAttackEvents';
import Config from './config';
import ConfigLib from '../lib/config';
import BattleEvents from './battleEvents';
import mutualSpaceCollection from '../../MutualSpace/lib/collection';
import mutualSpaceConfig from '../../MutualSpace/lib/config';
import Hex from '../../MutualSpace/lib/Hex';
import Reptiles from './reptiles';

const WITHDRAW_TIME_MARGIN = 30;

const tradeCodes = {
  'Unit/Human/Space/Gammadrone': {
    metals: 10000,
  },
  'Unit/Human/Space/Wasp': {
    crystals: 3000,
  },
  'Unit/Human/Space/Mirage': {
    humans: 1000,
  },
  'Unit/Human/Space/Railgun': {
    credits: 100,
  },
};

Meteor.methods({
  'space.attackReptileFleet'(baseId, targetId, units) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.attackReptileFleet', user });

    check(baseId, String);
    check(targetId, String);
    check(units, Object);

    const basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      throw new Meteor.Error('Планета не существует');
    }

    const { canSend, needSliceArmy } = Space.checkSendFleet({
      planet: basePlanet,
      units,
      userId: user._id,
    });

    if (!canSend) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
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

    const engineLevel = Game.Planets.getEngineLevel(user);

    const startPosition = {
      x: basePlanet.x,
      y: basePlanet.y,
    };
    const startPositionWithOffset = { ...startPosition };

    // check time
    const timeCurrent = Game.getCurrentTime();
    const timeLeft = Game.dateToTime(enemyShip.after) - timeCurrent;

    const fromGalaxy = mutualSpaceCollection.findOne({ username: basePlanet.username });
    if (fromGalaxy) {
      const hex = new Hex(fromGalaxy);
      const center = hex.center();
      startPositionWithOffset.x += center.x;
      startPositionWithOffset.y += center.y;
    }

    const attackOptions = calcAttackOptions({
      attackerPosition: startPositionWithOffset,
      attackerEngineLevel: engineLevel,
      targetShip: enemyShip,
      timeCurrent,
    });

    if (!attackOptions || attackOptions.time >= timeLeft) {
      throw new Meteor.Error('Невозможно перехватить');
    }

    const timeAttack = attackOptions.time;

    if (timeAttack > mutualSpaceConfig.MAX_FLY_TIME) {
      throw new Meteor.Error('Слишком долгий перелет');
    }

    let { k } = attackOptions;
    if (k > 1) {
      k = 1;
    } else if (k < 0) {
      k = 0;
    }

    const enemyStartPosition = { ...enemyShip.data.startPosition };
    const enemyTargetPosition = { ...enemyShip.data.targetPosition };

    if (enemyShip.data.mission.type === 'prisoners') {
      if (enemyShip.data.hex) {
        const center = new Hex(enemyShip.data.hex).center();
        enemyStartPosition.x += center.x;
        enemyStartPosition.y += center.y;
      }

      if (enemyShip.data.targetHex) {
        const targetHexCenter = new Hex(enemyShip.data.targetHex).center();
        enemyTargetPosition.x += targetHexCenter.x;
        enemyTargetPosition.y += targetHexCenter.y;
      }
    }

    const vector = {
      x: enemyTargetPosition.x - enemyStartPosition.x,
      y: enemyTargetPosition.y - enemyStartPosition.y,
    };

    const targetX = enemyStartPosition.x + (vector.x * k);
    const targetY = enemyStartPosition.y + (vector.y * k);

    const targetPosition = {
      x: targetX,
      y: targetY,
    };

    // check and slice units
    let sourceArmyId = basePlanet.armyId;
    if (basePlanet.isHome) {
      sourceArmyId = Game.Unit.getHomeFleetArmy()._id;
    }

    let newArmyId;

    if (needSliceArmy) {
      newArmyId = Game.Unit.sliceArmy(sourceArmyId, units, Game.Unit.location.SHIP);
    } else {
      newArmyId = sourceArmyId;
      Game.Unit.moveArmy(newArmyId, Game.Unit.location.SHIP);

      basePlanet.armyId = null;
      basePlanet.armyUsername = null;
      Game.Planets.update(basePlanet);
    }

    const flightData = {
      targetType: FlightEvents.TARGET.SHIP,
      userId: user._id,
      username: user.username,
      startPosition,
      startPlanetId: basePlanet._id,
      targetPosition,
      targetId: enemyShip._id,
      flyTime: timeAttack,
      isHumans: true,
      isOneway: false,
      engineLevel,
      mission: null,
      armyId: newArmyId,
    };

    if (enemyShip.data.mission.type === 'prisoners') {
      flightData.global = true;
    }

    if (fromGalaxy) {
      const fromHex = new Hex(fromGalaxy);
      flightData.hex = fromHex;
      flightData.targetHex = (
        enemyShip.data.mission.type === 'prisoners'
          ? { x: 0, z: 0 }
          : enemyShip.data.targetHex || fromHex
      );
    }

    FlightEvents.add(flightData);

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

    let target;
    let targetHex;

    if (targetType === FlightEvents.TARGET.PLANET) {
      if (baseId === targetId) {
        throw new Meteor.Error('Стартовая планета и конечная должны быть разными');
      }

      const targetPlanet = Game.Planets.getOne(targetId);
      if (!targetPlanet) {
        throw new Meteor.Error('Не найдена конечная планета');
      }

      target = targetPlanet;

      const toGalaxy = mutualSpaceCollection.findOne({ username: target.username });

      if (toGalaxy) {
        targetHex = new Hex(toGalaxy);
      }
    } else if (targetType === FlightEvents.TARGET.BATTLE) {
      const battleEvent = BattleEvents.findByBattleId(targetId);

      if (!battleEvent) {
        throw new Meteor.Error('Не найдено сражение');
      }

      target = {
        _id: targetId,
        x: battleEvent.data.targetPosition.x,
        y: battleEvent.data.targetPosition.y,
      };

      if (battleEvent.data.mission && battleEvent.data.mission.type === 'prisoners') {
        target.global = true;
      }

      ({ targetHex } = battleEvent.data);
    } else {
      throw new Meteor.Error('Неверный параметр типа цели.');
    }

    const basePlanet = Game.Planets.getOne(baseId);
    if (!basePlanet) {
      throw new Meteor.Error('Не найдена стартовая планета');
    }

    if (!basePlanet.armyId) {
      throw new Meteor.Error('Не найдена армия на планете');
    }

    const { canSend, needSliceArmy } = Space.checkSendFleet({
      planet: basePlanet,
      units,
      userId: user._id,
    });

    if (!canSend) {
      throw new Meteor.Error('Слишком много флотов уже отправлено');
    }

    //
    let isResourceTransfer = false;
    const resourcesToTransfer = {};
    if (
      basePlanet.isHome
      && user.username === basePlanet.username
      && target.isHome
      && basePlanet.username !== target.username
      && units['Unit/Human/Space/TruckC'] > 0
    ) {
      let trukcsAvaliable = units['Unit/Human/Space/TruckC'];

      _.toPairs(tradeCodes).forEach(([key, resources]) => {
        if (units[key] > 0) {
          _.merge(
            resourcesToTransfer,
            _.mapValues(resources, price => price * units[key])
          );

          trukcsAvaliable -= units[key];
        }
      });

      if (trukcsAvaliable < 0) {
        throw new Meteor.Error('Недостаточно траков');
      }

      if (!Game.Resources.has({ resources: resourcesToTransfer })) {
        throw new Meteor.Error('У вас недостаточно ресурсов');
      }
      isResourceTransfer = true;
    }
    //

    const startPosition = {
      x: basePlanet.x,
      y: basePlanet.y,
    };
    const startPositionWithOffset = { ...startPosition };

    const fromGalaxy = mutualSpaceCollection.findOne({ username: basePlanet.username });

    if (fromGalaxy) {
      const center = new Hex(fromGalaxy).center();
      startPositionWithOffset.x += center.x;
      startPositionWithOffset.y += center.y;
    }

    const targetPosition = {
      x: target.x,
      y: target.y,
    };
    const targetPositionWithOffset = { ...targetPosition };

    if (targetHex) {
      const center = new Hex(targetHex).center();
      targetPositionWithOffset.x += center.x;
      targetPositionWithOffset.y += center.y;
    }

    const engineLevel = Game.Planets.getEngineLevel(user);

    const flyTime = Utils.calcFlyTime(
      startPositionWithOffset,
      targetPositionWithOffset,
      engineLevel,
    );

    if (flyTime > mutualSpaceConfig.MAX_FLY_TIME) {
      throw new Meteor.Error('Слишком долгий перелет');
    }

    // slice units
    let sourceArmyId = basePlanet.armyId;
    if (basePlanet.isHome) {
      sourceArmyId = Game.Unit.getHomeFleetArmy()._id;
    }

    let newArmyId;

    if (needSliceArmy) {
      newArmyId = Game.Unit.sliceArmy(sourceArmyId, units, Game.Unit.location.SHIP);
    } else {
      newArmyId = sourceArmyId;
      Game.Unit.moveArmy(newArmyId, Game.Unit.location.SHIP);

      basePlanet.armyId = null;
      basePlanet.armyUsername = null;
    }

    basePlanet.timeRespawn = Game.getCurrentTime() + Config.ENEMY_RESPAWN_PERIOD;
    Game.Planets.update(basePlanet);

    const flightData = {
      userId: user._id,
      username: user.username,
      targetType,
      isHumans: true,
      startPosition,
      startPlanetId: basePlanet._id,
      targetPosition,
      targetId: target._id,
      flyTime,
      engineLevel,
      isOneway,
      armyId: newArmyId,
    };

    if (isResourceTransfer) {
      flightData.resourcesToTransfer = resourcesToTransfer;
      Game.Resources.sold(resourcesToTransfer, user._id);
    }

    if (target.global) {
      flightData.global = true;
    }

    if (fromGalaxy) {
      flightData.hex = new Hex(fromGalaxy);
    }

    flightData.targetHex = targetHex || flightData.hex;

    FlightEvents.add(flightData);

    // if planet is colony
    if (
      !basePlanet.isHome
      && (basePlanet.armyId || basePlanet.status === Game.Planets.STATUS.HUMANS)
    ) {
      // add reptiles attack trigger
      TriggerAttackEvents.add({
        targetPlanet: basePlanet._id,
        userId: user._id,
        username: user.username,
      });
    }

    // save statistic
    Game.Statistic.incrementUser(user._id, {
      'cosmos.fleets.sent': 1,
    });
  },

  'space.withdrawFleet'(shipId) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.withdrawFleet', user });

    check(shipId, String);

    const currentTime = Math.floor(new Date().getTime() / 1000);
    const ship = FlightEvents.getOne(shipId);
    if (!ship) {
      throw new Meteor.Error('Корабль не существует');
    }
    if (!ship.data.isHumans) {
      throw new Meteor.Error('Рептилии не подчиняются людям');
    }
    if (ship.data.userId !== user._id) {
      throw new Meteor.Error('Нельзя командовать чужим флотом');
    }
    if (ship.data.isBack) {
      throw new Meteor.Error('Флот уже возвращается');
    }
    if (Game.dateToTime(ship.after) - currentTime < WITHDRAW_TIME_MARGIN) {
      throw new Meteor.Error('Флот не успевает развернуться');
    }

    const userResources = Game.Resources.getValue();
    if (userResources.credits.amount < ConfigLib.WITHDRAW_PRICE) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    Game.Resources.spend({
      credits: ConfigLib.WITHDRAW_PRICE,
    });

    Game.Payment.Expense.log(ConfigLib.WITHDRAW_PRICE, 'withdrawFleet', {
      jobId: shipId,
    });

    const shipJob = Space.jobs.getJob(shipId);

    if (shipJob) {
      shipJob.cancel();
      const backData = FlightEvents.reverseFlightData(shipJob.data);
      FlightEvents.add(backData, (currentTime - Game.dateToTime(shipJob.doc.created)) * 1000);
    }
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

  'space.cancelAndRestartJob'(id) {
    const user = User.getById();
    User.checkAuth({ user });

    check(id, String);

    Log.method.call(this, { name: 'space.cancelAndRestartJob', user });

    if (user.role !== 'admin') {
      throw new Meteor.Error('Админамана нада!');
    }

    const job = Space.jobs.getJob(id);
    if (job) {
      job.cancel();
      job.restart();
    }
  },

  'space.spawnKrampusFleet'() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'space.spawnKrampusFleet', user });

    if (user.role !== 'admin') {
      throw new Meteor.Error('Ты не дед мороз.');
    }

    Reptiles.spawnKrampusFleet();
  },
});

