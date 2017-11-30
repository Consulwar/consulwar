import { Meteor } from 'meteor/meteor';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import collection from '../lib/collection';
import Config from '../lib/config';

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

    const result = collection.upsert({
      username: { $exists: false },
    }, {
      $set: {
        username: user.username,
      },
    });

    if (result.insertedId) {
      return {
        hexes: collection.find({}).fetch(),
        insertedId,
      };
    }
  },

  'mutualSpace.getHexes'() {
    return collection.find({}).fetch();
  },
});
