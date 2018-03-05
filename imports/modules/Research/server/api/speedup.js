import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import { Game } from '/moduls/game/lib/main.game';
import researches from '/imports/content/Research/server';

Meteor.methods({
  'research.speedup'({ id, cards }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'research.speedup', user });

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

    if (cardList.length === 0) {
      throw new Meteor.Error('Карточки не выбраны');
    }

    Meteor.call('actualizeGameInfo');

    const research = researches[id];

    if (!research) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    const task = Game.Queue.getGroup(research.group);
    if (!task || task.itemId !== id) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    const maxSpendTime = task.finishTime - Game.getCurrentTime() - 2;

    const priceWithoutCards = research.getPrice(null);
    const priceWithCards = research.getPrice(null, cardList);

    const spendTime = Math.min(priceWithoutCards.time - priceWithCards.time, maxSpendTime);

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    Game.Queue.spendTime(task._id, spendTime);

    cardList.forEach(card => Game.Cards.activate(card, user));

    Game.Cards.spend(cardsObject);
  },
});
