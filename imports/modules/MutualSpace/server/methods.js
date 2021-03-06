import { Meteor } from 'meteor/meteor';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import Game from '/moduls/game/lib/main.game';
import collection from '../lib/collection';
import Config from '../lib/config';
import Hex from '../lib/Hex';
import Space from '../../Space/lib/space';
import SpaceConfig from '../../Space/server/config';

Meteor.methods({
  'mutualSpace.access'() {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'mutualSpace.access', user });

    if (collection.findOne({ username: user.username })) {
      throw new Meteor.Error('Выход в общий космос уже осуществлен.');
    }

    if (user.rating < Config.ACCESS_RATING) {
      throw new Meteor.Error('Недостаточно рейтинга.');
    }

    if (Game.Planets.getLastFunTime() + (30 * SpaceConfig.FUN_PERIOD) > Game.getCurrentTime()) {
      throw new Meteor.Error('Ты не готов!');
    }

    const id = collection.aggregate([
      { $match: { username: { $exists: false } } },
      { $sample: { size: 1 } },
    ])[0]._id;

    // To avoid occupation of same hex by different processes we're checking username
    const success = collection.update({
      _id: id,
      username: { $exists: false },
    }, {
      $set: {
        username: user.username,
      },
    });

    if (success === 0) {
      throw new Meteor.Error('Ого, вот это да! Попробуйте ещё раз');
    }

    const hex = new Hex(collection.findOne({ username: user.username }));
    const hexToDB = { x: hex.x, z: hex.z };

    Space.collection.update({
      'data.userId': user._id,
      status: Space.filterActive,
    }, {
      $set: {
        'data.hex': hexToDB,
        'data.targetHex': hexToDB,
      },
    }, {
      multi: true,
    });

    return collection.find({}).fetch();
  },

  'mutualSpace.getHexes'() {
    const user = User.getById();
    User.checkAuth({ user });

    return collection.find({}).fetch();
  },
});
