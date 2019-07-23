import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import spaceport from '/imports/content/Building/Residential/server/SpacePort';
import fleetContainers from '/imports/content/Container/Fleet/server';
import Game from '/moduls/game/lib/main.game';

Meteor.methods({
  'Building/Residential/SpacePort.buyContainer'({ id, count = 1 }) {
    const user = User.getById();
    User.checkAuth({ user });

    check(id, String);
    check(count, Match.Integer);

    Log.method.call(this, {
      name: 'Building/Residential/SpacePort.buyContainer',
      user,
    });

    if (!spaceport.has({ level: 1, user })) {
      throw new Meteor.Error('Нужно построить Космопорт');
    }

    if (count < 1) {
      throw new Meteor.Error('Контейнеры не продаются');
    }

    const container = fleetContainers[id];
    if (!container) {
      throw new Meteor.Error('Нет такого контейнера');
    }

    container.buy({ count, userId: user._id });
  },

  'Building/Residential/SpacePort.openContainer'({ id, count = 1 }) {
    const user = User.getById();
    User.checkAuth({ user });

    check(id, String);
    check(count, Match.Integer);

    Log.method.call(this, {
      name: 'Building/Residential/SpacePort.openContainer',
      user,
    });

    if (count < 1) {
      throw new Meteor.Error('Контейнеры не закрываются');
    }

    if (count > 1000) {
      throw new Meteor.Error('Максимум 1000 контейнеров за раз');
    }

    const container = fleetContainers[id];
    if (!container) {
      throw new Meteor.Error('Нет такого контейнера');
    }

    const profit = container.open({ userId: user._id, count });

    Game.Statistic.incrementUser(user._id, {
      'containers.open': count,
    });

    return profit;
  },
});
