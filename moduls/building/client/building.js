initBuildingClient = function() {
'use strict';

initBuildingLib();

Game.Building.showPage = function() {
  var item = Game.Building.items[this.params.group][this.params.item];
  var menu = this.params.menu;
  
  if (item) {
    this.render('item_building', {to: 'content', data: { building: item, submenu: menu } });
    this.render('empty', {to: 'item_submenu'});

    switch (menu) {
      case 'tournaments':
        this.render('colosseum', { to: 'item_submenu' });
        break;
      case 'bonus':
        this.render('pulsecatcher', {to: 'item_submenu'});
        break;
    }
  } else {
    this.render('empty', { to: 'content' });
  }
};

Template.item_building.onRendered(function() {
});

var bonusEvents = {
  'click .collectBonus.metals, click button.metal': function(e, t) {
    Meteor.call('getBonusResources', 'metals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный металл', error.error);
      } else {
        Notifications.success('Бонусный металл получен', '+' + result);
      }
    });
  },

  'click .collectBonus.crystals, click button.crystal': function(e, t) {
    Meteor.call('getBonusResources', 'crystals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный кристалл', error.error);
      } else {
        Notifications.success('Бонусный кристалл получен', '+' + result);
      }
    });
  }
};

Template.overlay_menu.events(bonusEvents);
Template.item_building.events(bonusEvents);

Template.item_building.helpers({
  resources: function() {
    return Game.Resources.currentValue.get();
  },
  income: function() {
    return Game.Resources.getIncome();
  },
  bonusStorage: function() { 
    return Game.Resources.bonusStorage;
  }
});

Template.item_building.events({
  'click button.build': function(e, t) {
    var item = t.data.building;

    Meteor.call('building.build', {
        group: item.group,
        engName: item.engName
      },
      function(error, message) {
        if (error) {
          Notifications.error('Невозможно начать строительство', error.error);
        } else {
          Notifications.success('Строительство запущено');
        }
      }
    );

    if (item.currentLevel() === 0) {
      Router.go(item.url({group: item.group}));
    }
  },

  'click button.market': function(e, t) {
    Game.Building.special.Market.showWindow();
  },

  'click button.containers': function(e, t) {
    Game.Building.special.Container.showWindow();
  },

  'click .toggle_description': function(e, t) {
    $(t.find('.description')).slideToggle(function() {
      var options = Meteor.user().settings && Meteor.user().settings.options;
      Meteor.call('settings.setOption', 'hideDescription', !(options && options.hideDescription));
    });
  }
});


initBuildingSpecialMarketClient();
initBuildingSpecialColosseumClient();
initBuildingSpecialContainerClient();
initBuildingSpecialPulsecatcherClient();

};