import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import User from '../../User/server/User';
import Game from '../../../../moduls/game/lib/main.game';
import BattleEvents from '../../Space/server/battleEvents';
import Space from '../../Space/lib/space';
import collection from '../lib/collection';
import Log from '../../Log/server/Log';
import Config from '../lib/config';
import SpaceConfig from '../../Space/server/config';
import evict from './eviction';

Meteor.methods({
  'mutualSpace.comeBack'(username) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'mutualSpace.comeBack', user });

    const isAdmin = ['admin'].indexOf(user.role) >= 0;

    if (!isAdmin) {
      throw new Meteor.Error('Не админ.');
    }

    check(username, String);

    const targetUser = Meteor.users.findOne({ username });

    if (!targetUser) {
      throw new Meteor.Error('Игрок не найден');
    }

    const hex = collection.findOne({ username });
    if (!hex) {
      throw new Meteor.Error('Игрок не в общем космосе.');
    }

    const hexDB = { x: hex.x, z: hex.z };

    const hasBattle = Space.collection.findOne({
      type: BattleEvents.EVENT_TYPE,
      status: Space.filterActive,
      'data.targetHex': hexDB,
    });

    if (hasBattle) {
      throw new Meteor.Error('В галактике игрока проходят сражения.');
    }

    evict(username);
  },

  'mutualSpace.putInHex'(username, hex) {
    const user = User.getById();
    User.checkAuth({ user });

    check(username, String);
    check(hex, Object);

    Log.method.call(this, { name: 'mutualSpace.putInHex', user });

    if (user.role !== 'admin') {
      throw new Meteor.Error('Админамана нада!');
    }

    const targetUser = User.getByUsername({ username });

    if (!targetUser) {
      throw new Meteor.Error('Пользователь не найден');
    }

    if (collection.findOne({ username: targetUser.username })) {
      throw new Meteor.Error('Выход в общий космос уже осуществлен.');
    }

    if (targetUser.rating < Config.ACCESS_RATING) {
      throw new Meteor.Error('Недостаточно рейтинга.');
    }

    const lastFun = Game.Planets.getLastFunTime({ userId: targetUser._id });
    if (lastFun + (30 * SpaceConfig.FUN_PERIOD) > Game.getCurrentTime()) {
      throw new Meteor.Error('Ты не готов!');
    }

    const homePlanet = Game.Planets.getBase(targetUser._id);
    if (!homePlanet) {
      throw new Meteor.Error('Перед выходом в общий космос необходимо разведать все планеты.');
    }

    const { galactic } = homePlanet;
    const planets = Game.Planets.getAll(targetUser._id).fetch();
    const hands = {};
    let allCount = 0;
    planets.forEach(({ hand, segment }) => {
      if (!hands[hand]) {
        hands[hand] = {};
      }

      if (!hands[hand][segment]) {
        hands[hand][segment] = true;
        allCount += 1;
      }
    });

    if (allCount !== ((galactic.hands * galactic.segments) + 1)) {
      throw new Meteor.Error('Перед выходом в общий космос необходимо разведать все планеты.');
    }

    const targetHex = collection.findOne({ x: hex.x, z: hex.z });

    if (!targetHex) {
      throw new Meteor.Error('Гекс не найден');
    }

    if (targetHex.username) {
      throw new Meteor.Error('Гекс уже занят');
    }

    collection.update({
      x: hex.x,
      z: hex.z,
    }, {
      $set: {
        username: targetUser.username,
      },
    });

    Space.collection.update({
      'data.userId': targetUser._id,
      status: Space.filterActive,
    }, {
      $set: {
        'data.hex': hex,
        'data.targetHex': hex,
      },
    }, {
      multi: true,
    });

    return collection.find({}).fetch();
  },
});
