import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import humanUnits from '/imports/content/Unit/Human/server';

Meteor.methods({
  'unit.speedup'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.speedup', user });

    check(id, String);

    Meteor.call('actualizeGameInfo');

    const unit = humanUnits[id];

    if (!unit) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    const task = Game.Queue.getGroup(unit.queue || unit.group);
    if (!task || task.itemId !== id) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    const spendTime = task.finishTime - Game.getCurrentTime() - 2;

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    const price = Game.Queue.getSpeedupPrice(unit, task);

    if (!Game.Resources.has({
      resources: price,
      user,
    })) {
      throw new Meteor.Error('Недостаточно ГГК');
    }

    Game.Resources.spend(price);

    Game.Queue.spendTime(task._id, spendTime);
  },
});
