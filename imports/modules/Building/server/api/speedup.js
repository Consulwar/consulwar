import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import buildings from '/imports/content/Building/server';

Meteor.methods({
  'building.speedup'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.speedup', user });

    check(id, String);

    Meteor.call('actualizeGameInfo');

    const building = buildings[id];

    if (!building) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    const task = Game.Queue.getGroup(building.group);
    if (!task || task.itemId !== id) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    const spendTime = task.finishTime - Game.getCurrentTime() - 2;

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    const price = Game.Queue.getSpeedupPrice(building, task);

    if (!Game.Resources.has({
      resources: price,
      user,
    })) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    Game.Resources.spend(price);

    Game.Queue.spendTime(task._id, spendTime);

    Game.Payment.Expense.log(price.credits, 'buildingSpeedup', {
      itemId: id,
      time: spendTime,
    });
  },
});
