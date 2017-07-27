initResourcesClient = function() {
'use strict';

initResourcesLib();
initResourcesClientArtefacts();

Meteor.subscribe('resources');

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
      baseValue.humans.bonusSeconds
    );

    baseValue.crystals = Game.Resources.calculateFinalAmount(
      baseValue.crystals.amount, 
      income.crystals, 
      delta,
      baseValue.crystals.bonusSeconds,
      baseValue.crystals.bonus
    );

    baseValue.metals = Game.Resources.calculateFinalAmount(
      baseValue.metals.amount, 
      income.metals, 
      delta,
      baseValue.metals.bonusSeconds,
      baseValue.metals.bonus
    );

    baseValue.honor = Game.Resources.calculateFinalAmount(
      baseValue.honor.amount, 
      income.honor, 
      delta,
      baseValue.honor.bonusSeconds
    );

    baseValue.credits = Game.Resources.calculateFinalAmount(
      baseValue.credits.amount, 
      income.credits, 
      delta,
      baseValue.credits.bonusSeconds
    );

    Game.Resources.currentValue.set(baseValue);
  }
});

Template.current_resources.events({
  'click .resources .credits': function(e, t) {
    Game.Payment.showWindow();
  },
  'mouseover .resources > div:not(.artefacts)': function(e, t) {
    let target = $(e.currentTarget);
    let tooltip = Blaze._globalHelpers.incomeTooltip(
      Game.Resources.getIncome().effects, 
      target.attr('class')
    )
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
});

Template.current_resources.helpers({
  resources: function() { return Game.Resources.currentValue.get(); }
});


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