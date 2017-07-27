initHouseClient = function() {
'use strict';

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {
  var subgroup = this.params.subgroup;
  var item = this.params.item;

  if (subgroup && !item) {
    item = _.keys(Game.House.items[subgroup])[0];
  }

  if (subgroup && item) {
    // show item menu
    var templateName = '';
    if (subgroup == 'cards') {
      templateName = 'consulHouseCards';
      item = Game.Cards.items.general[item];
    } else if (subgroup == 'donate') {
      templateName = 'consulHouseDonate';
      item = Game.Cards.items.donate[item];
    } else {
      templateName = 'consulHouseItem';
      item = Game.House.items[subgroup][item];
    }

    this.render(templateName, {
      to: 'content',
      data: {
        subgroup: subgroup,
        item: item
      }
    });
  } else {
    // show consul house
    this.render('consulHouse', {
      to: 'content'
    });
  }
};

// ----------------------------------------------------------------------------
// Consul house overview
// ----------------------------------------------------------------------------

var isLoading = new ReactiveVar(false);
var houseItems = new ReactiveVar(null);

Template.consulHouse.onRendered(function() {
  this.autorun(function() {
    var username = Router.current().getParams().hash;
    if (!username || username == Meteor.user().username) {
      houseItems.set( Game.House.getPlacedItems() );
    } else {
      houseItems.set(null);
      isLoading.set(true);
      Meteor.call('house.getPlacedItems', username, function(err, result) {
        isLoading.set(false);
        if (err) {
          Notifications.error('Не удалось открыть палату консула', err.error);
        } else {
          for (let i = 0; i < result.length; i++) {
            let item = result[i];
            result[i] = _.clone(Game.House.items[item.subgroup][item.engName]);
            result[i].currentLevel = function() {
              return 1;
            };
          }
          houseItems.set(result);
        }
      });
    }
  });
});

Game.House.getActiveItems = function() {
  return houseItems.get();
}

Template.consulHouse.helpers({
  isLoading: function() { return isLoading.get(); },
  items: function() { return houseItems.get(); },
  consulName: function() {
    var hash = Router.current().getParams().hash;
    return (hash && hash != Meteor.user().username) ? hash : null;
  }
});

// ----------------------------------------------------------------------------
// Consul house item menu
// ----------------------------------------------------------------------------

Template.consulHouseItem.helpers({
  subgroupItems: function() {
    var group = Template.instance().data.subgroup;
    return _.map(Game.House.items[group], function(item) {
      return item;
    });
  }
});

Template.consulHouseItem.events({
  'click .buy': function(e, t) {
    var group = t.data.subgroup;

    if (!t.data.item.canBuy()) {
      return Notifications.error('Недостаточно денег!');
    }

    Meteor.call('house.buyItem', group, t.data.item.engName, function(err) {
      if (err) {
        Notifications.error('Не удалось купить предмет', err.error);
      } else {
        Notifications.success('Предмет куплен');
      }
    });
  },

  'click .place': function(e, t) {
    var group = t.data.subgroup;

    Meteor.call('house.placeItem', group, t.data.item.engName, function(err) {
      if (err) {
        Notifications.error('Не удалось установить предмет', err.error);
      } else {
        Notifications.success('Предмет установлен в палату');
      }
    });
  }
});

// ----------------------------------------------------------------------------
// Consul house cards menu
// ----------------------------------------------------------------------------

Template.consulHouseCards.events({
  'click .buy': function(e, t) {
    if (!t.data.item.canBuy()) {
      return Notifications.error('Недостаточно денег!');
    }

    Meteor.call('cards.buy', t.data.item.engName, function(err) {
      if (err) {
        Notifications.error('Не удалось купить карточку', err.error);
      } else {
        Notifications.success('Карточка куплена');
      }
    });
  },

  'click .activate': function(e, t) {
    Meteor.call('cards.activate', t.data.item.engName, function(err) {
      if (err) {
        Notifications.error('Не удалось активировать карточку', err.error);
      } else {
        Notifications.success('Карточка активирована');
      }
    });
  }
});

Template.consulHouseCards.helpers({
  getTimeLeft: function(timeEnd) {
    var timeLeft = timeEnd - Session.get('serverTime');
    return (timeLeft > 0) ? timeLeft : 0;
  },

  canActivate: function() {
    if (this.item.amount() <= 0) {
      return false;
    }

    var currentTime = Session.get('serverTime');
    var task = this.item.getActiveTask();
    if (task && task.finishTime > currentTime) {
      return false;
    }

    var reloadTime = this.item.nextReloadTime();
    if (reloadTime && reloadTime > currentTime) {
      return false;
    }

    return true;
  },

  finishTime: function() {
    var task = this.item.getActiveTask();
    return (task) ? task.finishTime : null;
  },

  reloadTime: function() {
    var reloadTime = this.item.nextReloadTime();
    return (reloadTime && reloadTime > Session.get('serverTime')) ? reloadTime : null;
  },

  subgroupItems: function() {
    return _.map(Game.Cards.items.general, function(item) {
      return item;
    });
  }
});

// ----------------------------------------------------------------------------
// Consul house donate menu
// ----------------------------------------------------------------------------

Template.consulHouseDonate.events({
  'click .activate': function (e, t) {
    Meteor.call('cards.activate', e.currentTarget.dataset.id, function (err, result) {
      if (err) {
        Notifications.error('Не удалось активировать бонус', err.error);
      } else {
        Notifications.success('Бонус активирован');
      }
    });
  },
  
  'click .buy': function (e, t) {
    var item = Game.Cards.getItem(e.currentTarget.dataset.id);
    if (!item || !item.canBuy()) {
      Notifications.error('Не хватает ГГК');
      return;
    }

    Meteor.call('cards.buyAndActivate', e.currentTarget.dataset.id, function (err, result) {
      if (err) {
        Notifications.error('Не удалось купить бонус', err.error);
      } else {
        Notifications.success('Бонус куплен');
      }
    });
  }
});

Template.consulHouseDonate.helpers({
  getTimeLeft: function(item) {
    var task = item.getActiveTask();
    if (!task) {
      return 0;
    }

    var timeLeft = task.finishTime - Session.get('serverTime');
    return (timeLeft > 0) ? timeLeft : 0;
  },

  subgroupItems: function() {
    return _.map(Game.Cards.items.donate, function(item) {
      return item;
    });
  }
});


};