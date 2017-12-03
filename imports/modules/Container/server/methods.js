import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Game from '/moduls/game/lib/main.game';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import fleetContainers from '/imports/content/Container/Fleet/server';

Meteor.methods({
  'Building/Residential/SpacePort.buyContainer'({ id, count = 1 }) {
    const user = User.getById();
    User.checkAuth({ user });

    check(id, String);
    check(count, Match.Integer);

    Log.method.call(this, {
      description: 'Building/Residential/SpacePort.buyContainer',
      user,
    });

    if (!Game.Building.items.residential.spaceport.has()) {
      throw new Meteor.Error('Нужно построить Космопорт');
    }

    if (count < 1) {
      throw new Meteor.Error('Контейнера не продаются');
    }

    const container = fleetContainers[id];
    if (!container) {
      throw new Meteor.Error('Нет такого контейнера');
    }

    container.buy({ count, userId: user._id });
  },

  'Building/Residential/SpacePort.openContainer'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    check(id, String);

    Log.method.call(this, {
      description: 'Building/Residential/SpacePort.openContainer',
      user,
    });

    const container = fleetContainers[id];
    if (!container) {
      throw new Meteor.Error('Нет такого контейнера');
    }

    return container.open({ userId: user._id });
  },
});
