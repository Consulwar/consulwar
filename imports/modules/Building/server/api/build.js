import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import Game from '/moduls/game/lib/main.game';
import buildings from '/imports/content/Building/server';

Meteor.methods({
  'building.build'({ id, cards }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.build', user });

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

    const building = buildings[id];

    if (!building || !building.canBuild()) {
      throw new Meteor.Error('Строительство невозможно');
    }

    const set = {
      group: building.group,
      itemId: building.id,
      level: building.getCurrentLevel() + 1,
    };

    if (set.level > building.maxLevel) {
      throw new Meteor.Error('Здание уже максимального уровня');
    }

    const price = building.getPrice(set.level, cardList);
    set.time = price.time;

    const isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать строительство');
    }

    cardList.forEach(card => Game.Cards.activate(card, user));

    Game.Cards.spend(cardsObject);

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

    Meteor.users.update({
      _id: user._id,
    }, {
      $inc: {
        rating: Game.Resources.calculateRatingFromResources(price),
      },
    });
  },
});
