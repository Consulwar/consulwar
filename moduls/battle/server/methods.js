import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import BattleCollection from '../lib/imports/collection';

Meteor.methods({
  'battle.getPage'(page, count, isEarth) {
    check(page, Match.Integer);
    check(count, Match.Integer);
    check(isEarth, Boolean);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battle.getPage', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    const cursor = BattleCollection.find({
      userNames: user.username,
      'options.isEarth': (isEarth ? true : null),
    }, {
      sort: { timeStart: -1 },
      skip: (page > 0) ? (page - 1) * count : 0,
      limit: count,
    });
    return { battles: cursor.fetch(), totalCount: cursor.count() };
  },

  'battle.getById'(id) {
    check(id, String);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battle.getById', user });

    return BattleCollection.findOne({
      _id: id,
    });
  },
});
