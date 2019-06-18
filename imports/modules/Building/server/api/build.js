import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import buildings from '/imports/content/Building/server';
import ConfigLib from '/imports/modules/Building/lib/config';

Meteor.methods({
  'building.build'({ id, level }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.build', user });

    check(id, String);
    check(level, Match.Integer);

    Meteor.call('actualizeGameInfo');

    const building = buildings[id];

    if (!building) {
      throw new Meteor.Error('Что-то не то вы строить собрались, дядя Фёдор');
    }

    if (level > building.maxLevel) {
      throw new Meteor.Error('Нельзя построить выше максимального уровня');
    }

    const currentLevel = building.getCurrentLevel();

    if (level <= currentLevel) {
      throw new Meteor.Error('Колонисты не рады попытке сноса строения');
    }

    if (!building.canBuild(level)) {
      throw new Meteor.Error('Строительство невозможно');
    }

    const price = building.getPrice(level);

    const set = {
      group: building.group,
      itemId: building.id,
      level,
      time: price.time,
      data: {
        price,
        rating: Game.Resources.calculateRatingFromResources(price),
      },
    };

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать строительство');
    }

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'building', {
        itemId: building.id,
        level: set.level,
      });
    }

    if (set.level > 40) {
      Game.Broadcast.add(
        user.username,
        `начал строительство «${building.title}» ${set.level} уровня`,
      );
    }
  },

  'building.cancel'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.cancel', user });

    check(id, String);

    Meteor.call('actualizeGameInfo');

    const building = buildings[id];

    if (!building) {
      throw new Meteor.Error('Что-то не то вы строить собрались, дядя Фёдор');
    }

    const queueItem = Game.Queue.getByItemId(id);

    if (!queueItem) {
      throw new Meteor.Error('Строительство уже завершилось, или не начиналось');
    }

    const price = (queueItem.data && queueItem.data.price
      ? queueItem.data.price
      : building.getPrice(queueItem.level)
    );
    const priceRefund = _.mapObject(price, priceItem => priceItem * ConfigLib.BUILDING_REFUND);

    const isTaskCancelled = Game.Queue.cancel(queueItem._id);
    if (!isTaskCancelled) {
      throw new Meteor.Error('Не удалось отменить строительство');
    }

    Game.Resources.add(priceRefund);

    if (priceRefund.credits) {
      Game.Payment.Income.log(priceRefund.credits, 'building', {
        itemId: building.id,
      });
    }

    if (!(queueItem.data && queueItem.data.rating)) { // Legacy item, rating was awarded at start
      Meteor.users.update({
        _id: user._id,
      }, {
        $inc: {
          rating: -Game.Resources.calculateRatingFromResources(price),
        },
      });
    }
  },
});
