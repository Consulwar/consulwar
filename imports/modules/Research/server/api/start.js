import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import researches from '/imports/content/Research/server';
import ConfigLib from '/imports/modules/Building/lib/config';

Meteor.methods({
  'research.start'({ id, level }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'research.start', user });

    check(id, String);
    check(level, Match.Integer);

    Meteor.call('actualizeGameInfo');

    const research = researches[id];

    if (!research) {
      throw new Meteor.Error('Что-то не то вы исследовать собрались, дядя Фёдор');
    }

    if (level > research.maxLevel) {
      throw new Meteor.Error('Нельзя исследовать выше максимального уровня');
    }

    const currentLevel = research.getCurrentLevel();

    if (level <= currentLevel) {
      throw new Meteor.Error('Нельзя разучиться');
    }

    if (!research.canBuild(level)) {
      throw new Meteor.Error('Исследование невозможно');
    }

    const price = research.getPrice(level);

    const set = {
      group: research.group,
      itemId: research.id,
      level,
      time: price.time,
      data: {
        price,
        rating: Game.Resources.calculateRatingFromResources(price),
      },
    };

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать исследование');
    }

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'researchStart', {
        itemId: research.id,
        count: set.level,
      });
    }

    if (set.level > 40) {
      Game.Broadcast.add(
        user.username,
        `начал исследование «${research.title}» ${set.level} уровня`,
      );
    }
  },

  'research.cancel'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'research.cancel', user });

    check(id, String);

    Meteor.call('actualizeGameInfo');

    const research = researches[id];

    if (!research) {
      throw new Meteor.Error('Что-то не то вы исследовать собрались, дядя Фёдор');
    }

    const queueItem = Game.Queue.getByItemId(id);

    if (!queueItem) {
      throw new Meteor.Error('Исследование уже завершилось, или не начиналось');
    }

    const price = (queueItem.data && queueItem.data.price
      ? queueItem.data.price
      : research.getPrice(queueItem.level)
    );
    const priceRefund = _.mapObject(
      price,
      priceItem => Math.floor(priceItem * ConfigLib.BUILDING_REFUND),
    );

    const isTaskCancelled = Game.Queue.cancel(queueItem._id);
    if (!isTaskCancelled) {
      throw new Meteor.Error('Не удалось отменить исследование');
    }

    Game.Resources.add(priceRefund);

    if (priceRefund.credits) {
      Game.Payment.Income.log(priceRefund.credits, 'researchStart', {
        itemId: research.id,
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
