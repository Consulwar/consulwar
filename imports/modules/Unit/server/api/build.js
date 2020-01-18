import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import humanUnits from '/imports/content/Unit/Human/server';
import DoomsDayGun from '/imports/content/Unit/Human/Defense/server/DoomsDayGun';
import ConfigLib from '/imports/modules/Building/lib/config';

Meteor.methods({
  'unit.build'({ id, count, cards }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.build', user });

    check(id, String);
    check(count, Match.Integer);

    let setCount = count;

    if (setCount < 1 || _.isNaN(setCount)) {
      throw new Meteor.Error('Не умничай');
    }

    let cardsObject = {};
    let cardList = [];

    if (cards) {
      check(cards, Object);

      cardsObject = cards;

      if (!Game.Cards.canUse({ cards: cardsObject, user })) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);
    }

    Meteor.call('actualizeGameInfo');

    const unit = humanUnits[id];

    if (!unit || !unit.canBuild(setCount, cards)) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    if (unit.maxCount !== undefined) {
      const countDelta = unit.maxCount - unit.getTotalCount();
      if (countDelta < 1) {
        throw new Meteor.Error('Достигнуто максимальное количество юнитов данного типа');
      }

      if (countDelta < setCount) {
        setCount = countDelta;
      }
    }

    const price = unit.getPrice(setCount, cardList);

    const { maxBuildTime } = Meteor.settings.public;
    if (count > 1 && price.time > maxBuildTime) {
      throw new Meteor.Error(`Максимальное время стройки: ${Game.Helpers.formatTime(maxBuildTime)}`);
    }

    const rating = Game.Resources.calculateRatingFromResources(price);

    const set = {
      group: unit.queue || unit.group,
      itemId: unit.id,
      count: setCount,
      dontNeedResourcesUpdate: true,
      time: price.time,
      data: {
        price,
        rating,
      },
    };

    if (id === DoomsDayGun.id && !User.canSelfVaip({ user })) {
      throw new Meteor.Error('Сперва завершите бои');
    }

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать подготовку юнитов');
    }

    cardList.forEach(card => Game.Cards.activate(card, user));

    Game.Cards.spend(cardsObject);

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'unitBuild', {
        itemId: unit.id,
        count: setCount,
      });
    }

    if (rating > 100000) {
      if (unit.group === 'Ground') {
        Game.Broadcast.add(
          user.username,
          `начал подготовку «${unit.title}» в количестве ${setCount} штук`,
        );
      } else {
        Game.Broadcast.add(
          user.username,
          `отправил на верфь ${setCount} кораблей «${unit.title}»`,
        );
      }
    }

    if (id === DoomsDayGun.id) {
      User.selfVaip({ user });
    }
  },

  'unit.cancel'({ id }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.cancel', user });

    check(id, String);

    Meteor.call('actualizeGameInfo');

    const unit = humanUnits[id];

    if (!unit) {
      throw new Meteor.Error('Что-то не то вы готовить собрались, дядя Фёдор');
    }

    const queueItem = Game.Queue.getByItemId(id);

    if (!queueItem) {
      throw new Meteor.Error('Подготовка уже завершилась, или не начиналась');
    }

    const price = (queueItem.data && queueItem.data.price
      ? queueItem.data.price
      : unit.getPrice(queueItem.count)
    );
    const priceRefund = _.mapObject(
      price,
      priceItem => Math.floor(priceItem * ConfigLib.BUILDING_REFUND),
    );

    const isTaskCancelled = Game.Queue.cancel(queueItem._id);
    if (!isTaskCancelled) {
      throw new Meteor.Error('Не удалось отменить подготовку');
    }

    Game.Resources.add(priceRefund);

    if (priceRefund.credits) {
      Game.Payment.Income.log(priceRefund.credits, 'unitBuild', {
        itemId: unit.id,
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
