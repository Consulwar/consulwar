import persons from '/imports/content/Person/client';
import allFleetContainers from '/imports/content/Container/Fleet/client';

initPromoCodeClient = function() {
'use strict';

// ----------------------------------------------------------------------------
// Reward window
// ----------------------------------------------------------------------------

Game.Payment.showPromocodeReward = function(profit) {
  Game.Popup.show({
    templateName: 'promocodeReward',
    data: {
      profit,
    },
  });
};

Template.promocodeReward.helpers({
  resources: function() {
    if (!this.profit || !this.profit.resources) {
      return null;
    }

    var result = [];

    for (var key in this.profit.resources) {
      if (!Game.Artefacts.items[key]) {
        result.push({
          engName: key,
          amount: this.profit.resources[key]
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  artefacts: function() {
    if (!this.profit || !this.profit.resources) {
      return null;
    }

    var result = [];

    for (var key in this.profit.resources) {
      if (Game.Artefacts.items[key]) {
        result.push({
          engName: key,
          amount: this.profit.resources[key]
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  units: function() {
    if (!this.profit || !this.profit.units) {
      return null;
    }

    var units = this.profit.units;
    var result = [];

    for (var group in units) {
      for (var name in units[group]) {
        result.push({
          engName: name,
          amount: units[group][name]
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  cards: function () {
    if (!this.profit || !this.profit.cards) {
      return null;
    }

    var cards = this.profit.cards;
    var result = [];

    for (var name in cards) {
      var item = Game.Cards.getItem(name);
      if (item) {
        result.push({
          engName: name,
          group: item.cardType,
          amount: cards[name]
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  containers: function () {
    if (!this.profit || !this.profit.containers) {
      return null;
    }

    var containers = this.profit.containers;
    var result = [];

    for (var name in containers) {
      var item = Game.Building.special.Container.items[name];
      if (item) {
        result.push({
          engName: name,
          amount: containers[name]
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  houseItems: function () {
    if (!this.profit || !this.profit.houseItems) {
      return null;
    }

    var items = this.profit.houseItems;
    var result = [];

    for (var group in items) {
      for (var name in items[group]) {
        result.push({
          engName: name,
          group: group
        });
      }
    }

    return result.length > 0 ? result : null;
  },

  personSkin() {
    if (!this.profit || !this.profit.personSkin) {
      return null;
    }

    var result = [];

    _(this.profit.personSkin).pairs().forEach(([personId, skins]) => {
      _(skins).keys().forEach((skinId) => {
        result.push(persons[personId].getImage(skinId));
      });
    });

    return result.length > 0 ? result : null;
  },
});

Template.promocodeReward.events({
  'click .take': function(e, t) {
    Blaze.remove(t.view);
  }
});

// ----------------------------------------------------------------------------
// Promo code admin
// ----------------------------------------------------------------------------

Game.Payment.showPromocodeCreate = function() {
  Blaze.render(Template.promocodeCreate, $('.over')[0]);
};

Template.promocodeCreate.helpers({
  loopCount: function(count) {
    var result = [];
    while (count-- > 0) {
      result.push(count);
    }
    return result;
  },

  options: function() {
    var result = [];

    result.push({ name: '----------------------------------------' });

    result.push({ id: 'votePower', name: 'Сила голоса' });

    result.push({ name: '----------------------------------------' });

    _(allFleetContainers).pairs().forEach(([id, container]) => {
      result.push({
        id: `containers.${id}`,
        name: container.title,
      });
    });

    result.push({ name: '----------------------------------------' });

    result.push({ id: 'resources.humans', name: 'Люди' });
    result.push({ id: 'resources.metals', name: 'Металл' });
    result.push({ id: 'resources.crystals', name: 'Кристалл' });
    result.push({ id: 'resources.honor', name: 'Честь' });
    result.push({ id: 'resources.credits', name: 'ГГК' });

    result.push({ name: '----------------------------------------' });

    for (var cardName in Game.Cards.items.donate) {
      result.push({
        id: 'cards.' + cardName,
        name: Game.Cards.items.donate[cardName].name
      });
    }

    result.push({ name: '----------------------------------------' });

    for (var unitGroup in Game.Unit.items.army) {
      for (var unitName in Game.Unit.items.army[unitGroup]) {
        result.push({
          id: 'units.' + unitGroup + '.' + unitName,
          name: Game.Unit.items.army[unitGroup][unitName].name
        });
      }
    }

    result.push({ name: '----------------------------------------' });

    for (var itemGroup in Game.House.items) {
      for (var itemName in Game.House.items[itemGroup]) {
        result.push({
          id: 'houseItems.' + itemGroup + '.' + itemName,
          name: Game.House.items[itemGroup][itemName].name
        });
      }
    }

    result.push({ name: '----------------------------------------' });

    for (var artefactName in Game.Artefacts.items) {
      result.push({
        id: 'resources.' + artefactName,
        name: Game.Artefacts.items[artefactName].name
      });
    }

    result.push({ name: '----------------------------------------' });

    _(persons).values().forEach((person) => {
      _(person.skin).pairs().forEach(([skinId, options]) => {
        if (!options.isFree && _(options).keys().length > 0) {
          result.push({
            id: `personSkin.${person.id}.${skinId}`,
            name: `${person.title} — ${skinId}`,
          });
        }
      });
    });

    return result;
  }
});

Template.promocodeCreate.events({
  'click .close': function(e, t) {
    Blaze.remove(t.view);
  },

  'click .create': function(e, t) {
    var object = null;

    var scriptText = t.find('textarea').value;
    if (scriptText && scriptText.length > 0) {

      // Create by script text
      try {
        object = JSON.parse(scriptText);
      } catch (error) {
        Notifications.error('Ошибка в скрипте', error.message);
        return;
      }

      if (!_.isObject(object)) {
        Notifications.error('Ошибка в скрипте', 'Это не json, а хуй знает что');
        return;
      }

    } else {

      // Create by GUI
      object = {};

      object.code = t.find('input[name="code"]').value;

      var maxActivations = parseInt( t.find('input[name="maxActivations"]').value );
      if (maxActivations > 1) {
        object.maxActivations = maxActivations;
      }

      var minutes = parseInt( t.find('input[name="minutes"]').value );
      if (minutes > 0) {
        object.validPeriod = minutes * 60;
      }

      var type = t.find('input[name="type"]').value;
      if (type && type.length > 0) {
        object.type = type;
      }

      if (t.find('input[name="random"]').checked) {
        object.profit = 'random';
      } else {
        var elements = $('.profit li');
        for (var i = 0; i < elements.length; i++) {
          var id = $(elements[i]).find(':selected').attr('name');
          var count = parseInt( $(elements[i]).find('input').val() );
          if (id && count > 0) {
            if (!object.profit) {
              object.profit = {};
            }

            var keys = id.split('.');
            var curObj = object.profit;

            for (var j = 0; j < keys.length; j++) {
              var key = keys[j];
              if (j == keys.length - 1) {
                if (!curObj[key]) {
                  curObj[key] = 0;
                }
                curObj[key] += count;
              } else {
                if (!curObj[key]) {
                  curObj[key] = {};
                }
                curObj = curObj[key];
              }
            }
          }
        }
      }

      if (!object.code || object.code.length < 1) {
        Notifications.error('Введите название промокода');
        return;
      }

      if (!object.profit) {
        Notifications.error('Укажите награду из списка или выберите рандом');
        return;
      }

    }

    if (_.isObject(object)) {
      Game.showAcceptWindow('Создать промокод: \n' + JSON.stringify(object), function() {
        Meteor.call('admin.addPromoCode', object, function(err) {
          if (err) {
            Notifications.error('Не удалось создать промокод', err.error);
          } else {
            Notifications.success('Промокод успешно создан');
          }
        });
      });
    }
  }
});

var countTotal = new ReactiveVar(null);
var historyCurrentFilterType = null;
var historyCurrentFilterValue = null;
var isLoading = new ReactiveVar(false);
var history = new ReactiveVar(null);
var historyCurrentPage;

Game.Payment.showPromocodeHistory = function() {
  var options = {};

  options.page = parseInt( Router.current().getParams().page, 10 );
  options.count = 20;

  var filterType = Router.current().getParams().filterType;
  var filterValue = Router.current().getParams().filterValue;
  if (filterType == 'username') {
    options.username = filterValue;
  }
  if (filterType == 'code') {
    options.code = filterValue;
  }

  if (options.page == historyCurrentPage
   && filterType == historyCurrentFilterType
   && filterValue == historyCurrentFilterValue
  ) {
    return; // Fucking Iron router! Prevent calling this action two times!
  }

  if (options.page && options.page > 0) {
    historyCurrentPage = options.page;
    historyCurrentFilterType = filterType;
    historyCurrentFilterValue = filterValue;

    history.set(null);
    countTotal.set(null);
    isLoading.set(true);

    Meteor.call('admin.getPromocodeHistory', options, function(err, data) {
      isLoading.set(false);
      if (err) {
        Notifications.error('Не удалось загрузить историю', err.error);
      } else {
        history.set(data.records);
        countTotal.set(data.count);
      }
    });

    this.render('promocodeHistory', {
      to: 'content',
      data: {
        count: options.count,
        username: options.username,
        code: options.code
      }
    });
  }
};

Template.promocodeHistory.onDestroyed(function() {
  historyCurrentPage = null;
  historyCurrentFilterType = null;
  historyCurrentFilterValue = null;
});

Template.promocodeHistory.helpers({
  username: function() { return this.username; },
  code: function() { return this.code; },
  count: function() { return this.count; },
  countTotal: function() { return countTotal.get(); },
  isLoading: function() { return isLoading.get(); },
  history: function() { return history.get(); }
});

Template.promocodeHistory.events({
  'change input[name="username"]': function(e, t) {
    // reset code filter
    t.find('input[name="code"]').value = '';
    // get username filter
    var username = e.currentTarget.value;
    if (username && username.length > 0) {
      Router.go('promocodeHistory', { page: 1, filterType: 'username', filterValue: username });
    } else {
      Router.go('promocodeHistory', { page: 1 });
    }
  },

  'change input[name="code"]': function(e, t) {
    // reset username filter
    t.find('input[name="username"]').value = '';
    // get code filter
    var code = e.currentTarget.value;
    if (code && code.length > 0) {
      Router.go('promocodeHistory', { page: 1, filterType: 'code', filterValue: code });
    } else {
      Router.go('promocodeHistory', { page: 1 });
    }
  }
});

};