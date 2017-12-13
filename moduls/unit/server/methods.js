import Log from '/imports/modules/Log/server/Log';
import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';
import User from '/imports/modules/User/server/User';

import FlightEvents from '/imports/modules/Space/server/flightEvents';

initUnitServerMethods = function() {
'use strict';

Meteor.methods({
  'unit.build': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.build', user });

    check(options, Object);
    check(options.group, String);
    check(options.engName, String);
    check(options.count, Number);

    options.count = parseInt(options.count, 10);

    if (options.count < 1 || _.isNaN(options.count)) {
      throw new Meteor.Error('Не умничай');
    }

    let cardsObject = {};
    let cardList = [];

    if (options.cards) {
      check(options.cards, Object);

      cardsObject = options.cards;

      if (!Game.Cards.canUse({ cards: cardsObject, user })) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);
    }

    Meteor.call('actualizeGameInfo');

    var item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

    if (!item || !item.canBuild(options.count)) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    if (item.maxCount !== undefined) {
      var countDelta = item.maxCount - item.totalCount();
      if (countDelta < 1) {
        throw new Meteor.Error('Достигнуто максимальное количество юнитов данного типа');  
      }

      if (countDelta < options.count) {
        options.count = countDelta;
      }
    }

    var set = {
      type: item.type,
      group: item.group,
      engName: item.engName,
      count: options.count,
      dontNeedResourcesUpdate: true
    };

    let price = item.price(options.count, cardList);
    set.time = price.time;

    var isTaskInserted = Game.Queue.add(set);
    if (!isTaskInserted) {
      throw new Meteor.Error('Не удалось начать подготовку юнитов');
    }

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);

    Game.Resources.spend(price);
    
    if (price.credits) {
      Game.Payment.Expense.log(price.credits, 'unitBuild', {
        group: set.group,
        name: set.engName,
        count: set.count
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

  'unit.speedup': function(options) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'unit.speedup', user });

    check(options, Object);
    check(options.group, String);
    check(options.engName, String);

    let cardsObject = {};
    let cardList = [];

    if (options.cards) {
      check(options.cards, Object);

      cardsObject = options.cards;

      if (!Game.Cards.canUse({ cards: cardsObject, user })) {
        throw new Meteor.Error('Карточки недоступны для применения');
      }

      cardList = Game.Cards.objectToList(cardsObject);
    }

    if (cardList.length === 0) {
      throw new Meteor.Error('Карточки не выбраны');
    }

    Meteor.call('actualizeGameInfo');

    let item = Game.Unit.items.army[options.group] && Game.Unit.items.army[options.group][options.engName];

    if (!item) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    let task = Game.Queue.getGroup(item.group);
    if (!task || task.engName !== options.engName) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    let maxSpendTime = task.finishTime - Game.getCurrentTime() - 2;

    let priceWithoutCards = item.price(task.count);
    let priceWithCards = item.price(task.count, cardList);

    let spendTime = Math.min(priceWithoutCards.time - priceWithCards.time, maxSpendTime);

    if (_.isNaN(spendTime) || spendTime <= 0) {
      throw new Meteor.Error('Ускорение подготовки юнитов невозможно');
    }

    Game.Queue.spendTime(task._id, spendTime);

    for (let card of cardList) {
      Game.Cards.activate(card, user);
    }

    Game.Cards.spend(cardsObject);
  },

  'battleHistory.getPage': function(page, count, isEarth) {
    check(page, Match.Integer);
    check(count, Match.Integer);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battleHistory.getPage', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    return Game.BattleHistory.Collection.find({
      user_id: isEarth ? 'earth' : user._id
    }, {
      sort: { timestamp: -1 },
      skip: (page > 0) ? (page - 1) * count : 0,
      limit: count
    }).fetch();
  },

  'battleHistory.getById': function(id, isEarth) {
    check(id, String);

    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'battleHistory.getById', user });

    return Game.BattleHistory.Collection.findOne({
      _id: id,
      user_id: isEarth ? 'earth' : user._id
    });
  }
});

};