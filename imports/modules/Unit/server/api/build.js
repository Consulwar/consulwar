import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import humanUnits from '/imports/content/Unit/Human/server';

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

    const item = humanUnits[id];

    if (!item || !item.canBuild(setCount, cards)) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    if (item.maxCount !== undefined) {
      const countDelta = item.maxCount - item.totalCount();
      if (countDelta < 1) {
        throw new Meteor.Error('Достигнуто максимальное количество юнитов данного типа');
      }

      if (countDelta < setCount) {
        setCount = countDelta;
      }
    }

    const set = {
      group: item.group,
      itemId: item.id,
      count: setCount,
      dontNeedResourcesUpdate: true,
    };

    const price = item.getPrice(setCount, cardList);
    set.time = price.time;

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать подготовку юнитов');
    }

    cardList.forEach(card => Game.Cards.activate(card, user));

    Game.Cards.spend(cardsObject);

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'unitBuild', {
        itemId: item.id,
        count: setCount,
      });
    }

    const rating = Game.Resources.calculateRatingFromResources(price);

    if (rating > 100000) {
      if (item.group === 'Ground') {
        Game.Broadcast.add(
          user.username,
          `начал подготовку «${item.name}» в количестве ${setCount} штук`,
        );
      } else {
        Game.Broadcast.add(
          user.username,
          `отправил на верфь ${setCount} кораблей «${item.name}»`,
        );
      }
    }

    Meteor.users.update({
      _id: user._id,
    }, {
      $inc: {
        rating,
      },
    });
  },
});
