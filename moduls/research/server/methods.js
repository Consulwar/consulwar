initResearchServerMethods = function(){
'use strict';

Meteor.methods({
  'research.start': function(options) {
    var user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'research.start');

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

    var item = Game.Research.items[options.group] && Game.Research.items[options.group][options.engName];

    if (!item || !item.canBuild()) {
      throw new Meteor.Error('Исследование невозможно');
    }

    var set = {
      type: item.type,
      group: item.group,
      engName: item.engName,
      level: item.currentLevel() + 1
    };

    if (set.level > item.maxLevel) {
      throw new Meteor.Error('Исследование уже максимального уровня');
    }

    let price = item.price(null, cardList);
    set.time = price.time;

    var isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать исследование');
    }

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);

    Game.Resources.spend(price);
    
    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'researchStart', {
        group: set.group,
        name: set.engName,
        count: set.level
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

  'research.speedup': function(options) {
    let user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method.call(this, 'research.speedup');

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

    let item = Game.Research.items[options.group] && Game.Research.items[options.group][options.engName];

    if (!item) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    let task = Game.Queue.getGroup(item.group);
    if (!task || task.engName !== options.engName) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    let maxSpendTime = task.finishTime - Game.getCurrentTime() - 2;

    let priceWithoutCards = item.price(null);
    let priceWithCards = item.price(null, cardList);

    let spendTime = Math.min(priceWithoutCards.time - priceWithCards.time, maxSpendTime);

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение исследования невозможно');
    }

    Game.Queue.spendTime(task._id, spendTime);

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);
  }
});

};