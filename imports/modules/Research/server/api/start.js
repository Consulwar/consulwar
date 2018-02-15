import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import researches from '/imports/content/Research/server';

Meteor.methods({
  'research.start'({ id, cards }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'research.start', user });

    check(id, String);

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

    const research = researches[id];

    if (!research || !research.canBuild()) {
      throw new Meteor.Error('Исследование невозможно');
    }

    const set = {
      group: research.group,
      itemId: research.id,
      level: research.getCurrentLevel() + 1,
    };

    if (set.level > research.maxLevel) {
      throw new Meteor.Error('Исследование уже максимального уровня');
    }

    const price = research.getPrice(set.level, cardList);
    set.time = price.time;

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать исследование');
    }

    cardList.forEach(card => Game.Cards.activate(card, user));

    Game.Cards.spend(cardsObject);

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

    Meteor.users.update({
      _id: user._id,
    }, {
      $inc: {
        rating: Game.Resources.calculateRatingFromResources(price),
      },
    });
  },
});
