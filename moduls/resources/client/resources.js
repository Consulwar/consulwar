import Game from "/moduls/game/lib/main.game";

initResourcesClient = function() {
'use strict';

initResourcesLib();
initResourcesClientArtefacts();

Game.Resources.currentValue = new ReactiveVar(Game.Resources.getValue());

Tracker.autorun(function(){
  var baseValue = Game.Resources.getValue();
  if (Meteor.user() && Meteor.user().game && baseValue) {
    var income = Game.Resources.getIncome();
    var currentTime = Session.get('serverTime');
    var delta = currentTime - baseValue.updated;

    baseValue.humans = Game.Resources.calculateFinalAmount(
      baseValue.humans.amount, 
      income.humans, 
      delta,
      baseValue.humans.leftover
    );

    baseValue.crystals = Game.Resources.calculateFinalAmount(
      baseValue.crystals.amount, 
      income.crystals, 
      delta,
      baseValue.crystals.leftover,
      baseValue.crystals.bonus
    );

    baseValue.metals = Game.Resources.calculateFinalAmount(
      baseValue.metals.amount, 
      income.metals, 
      delta,
      baseValue.metals.leftover,
      baseValue.metals.bonus
    );

    baseValue.honor = Game.Resources.calculateFinalAmount(
      baseValue.honor.amount, 
      income.honor, 
      delta,
      baseValue.honor.leftover
    );

    baseValue.credits = Game.Resources.calculateFinalAmount(
      baseValue.credits.amount, 
      income.credits, 
      delta,
      baseValue.credits.leftover
    );

    Game.Resources.currentValue.set(baseValue);
  }
});

Game.Resources.getAvailable = function(id, value) {
  if (id === 'time') {
    return;
  }
  const availableResource = Game.Resources.currentValue.get()[id]
    && Game.Resources.currentValue.get()[id].amount
    || 0;
  if (value && value <= availableResource) {
    return value;
  }
  return availableResource;
}

// TODO: Удалить (events & helpers для цены постройки)
// Используются в наградах до переделки не удалять
Template.item_price.events({
  'click .resources .credits': function(e, t) {
    Game.Payment.showWindow();
  },

  'click .resources .artefact': function(e, t) {
    Router.go('artefacts', {
      item: e.currentTarget.dataset.id
    });
  },
  'mouseover .resources > div': function(e, t) {
    let target = $(e.currentTarget);
    let tooltip = Blaze._globalHelpers.priceTooltip(
      this.price, 
      this.engName
    )
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
});

Template.item_price.helpers({
  getResources: function(price) {
    var result = [];
    for (var name in price) {
      var item = {
        engName: name,
        amount: price[name],
        price: price
      };
      if (price[name]) {
        if (name == 'time') {
          result.unshift(item);
        } else {
          result.push(item);
        }
      }
    }
    return result;
  },

  isArtefact: function(key) {
    return Game.Artefacts.items[key] ? true : false;
  }
});

};