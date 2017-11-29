import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initBuildingServerMethods = function(){
'use strict';

Meteor.methods({
  'building.build': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.build', user });

    check(options, Object);
    check(options.group, String);
    check(options.engName, String);

    let cardsObject = {};
    let cardList = [];

    if (options.cards) {
      check(options.cards, Object);

      cardsObject = options.cards;

      if (!Game.Cards.canUse(cardsObject, user)) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);
    }

    Meteor.call('actualizeGameInfo');

    var item = Game.Building.items[options.group] && Game.Building.items[options.group][options.engName];

    if (!item || !item.canBuild()) {
      throw new Meteor.Error('Строительство невозможно');
    }

    var set = {
      type: item.type,
      group: item.group,
      engName: item.engName,
      level: item.currentLevel() + 1
    };

    if (set.level > item.maxLevel) {
      throw new Meteor.Error('Здание уже максимального уровня');
    }

    let price = item.price(null, cardList);
    set.time = price.time;

    var isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать строительство');
    }

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);

    Game.Resources.spend(price);

    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'building', {
        group: set.group,
        name: set.engName,
        level: set.level
      });
    }

    Meteor.users.update({
      _id: user._id
    }, {
      $inc: {
        rating: Game.Resources.calculateRatingFromResources(price)
      }
    });
  },

  'building.speedup': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'building.speedup', user });

    check(options, Object);
    check(options.group, String);
    check(options.engName, String);

    let cardsObject = {};
    let cardList = [];

    if (options.cards) {
      check(options.cards, Object);

      cardsObject = options.cards;

      if (!Game.Cards.canUse(cardsObject, user)) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);
    }

    if (cardList.length === 0) {
      throw new Meteor.Error('Карточки не выбраны');
    }

    Meteor.call('actualizeGameInfo');

    let item = Game.Building.items[options.group] && Game.Building.items[options.group][options.engName];

    if (!item) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    let task = Game.Queue.getGroup(item.group);
    if (!task || task.engName !== options.engName) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    let maxSpendTime = task.finishTime - Game.getCurrentTime() - 2;

    let priceWithoutCards = item.price(null);
    let priceWithCards = item.price(null, cardList);

    let spendTime = Math.min(priceWithoutCards.time - priceWithCards.time, maxSpendTime);

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение строительства невозможно');
    }

    Game.Queue.spendTime(task._id, spendTime);

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);
  }
});

};