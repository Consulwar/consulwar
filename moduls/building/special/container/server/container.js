import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initBuildingSpecialContainerServer = function() {
'use strict';

initBuildingSpecialContainerLib();

Game.Building.special.Container.Collection._ensureIndex({
  user_id: 1
});

Game.Building.special.Container.initialize = function(user_id = Meteor.userId()) {
  var currentValue = Game.Building.special.Container.getValue(user_id);

  if (currentValue === undefined) {
    Game.Building.special.Container.Collection.insert({
      user_id,
    });
  }
};

Game.Building.special.Container.increment = function(containers, invertSign, user_id = Meteor.userId()) {
  invertSign = invertSign === true ? -1 : 1;

  Game.Building.special.Container.initialize(user_id);

  var inc = null;
  for (var key in containers) {
    if (!inc) {
      inc = {};
    }
    inc[key + '.amount'] = parseInt(containers[key] * invertSign);
  }

  if (inc) {
    Game.Building.special.Container.Collection.update({
      user_id,
    }, {
      $inc: inc,
    });
  }
};

Game.Building.special.Container.add = function(containers, user_id) {
  return Game.Building.special.Container.increment(containers, false, user_id);
};

Game.Building.special.Container.spend = function(containers, user_id) {
  return Game.Building.special.Container.increment(containers, true, user_id);
};

Meteor.methods({
  'containers.open': function(id) {
    const user = User.getById();
    User.checkAuth({ user });

    if (Game.Building.items.residential.spaceport.currentLevel() < 1) {
      throw new Meteor.Error('Нужно построить Космопорт');
    }

    Log.method.call(this, { name: 'containers.open', user });

    var container = Game.Building.special.Container.items[id];

    if (!container) {
      throw new Meteor.Error('Нет такого контейнера');
    }

    // roll profit
    var profit = Game.Resources.rollProfit(container.drop);

    if (container.amount() > 0) {

      // spend container
      var containers = {};
      containers[id] = 1;
      Game.Building.special.Container.spend(containers);

    } else {

      // check price
      Meteor.call('actualizeGameInfo');
      if (!container.checkPrice()) {
        throw new Meteor.Error('Невозможно купить контейнер');
      }

      // spend resources
      var price = container.getPrice();
      
      if (price) {
        Game.Resources.spend(price);

        if (price.credits) {
          Game.Payment.Expense.log(price.credits, 'container', {
            containerId: container.engName,
            profit: profit
          });
        }
      }
    }

    // add profit
    if (profit) {
      Game.Resources.addProfit(profit);
    }

    return profit;
  }
});

Meteor.publish('containers', function () {
  if (this.userId) {
    return Game.Building.special.Container.Collection.find({
      user_id: this.userId
    });
  }
});

};