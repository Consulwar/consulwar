import containers from '/imports/content/Container/Fleet/client/';

initBuildingSpecialContainerClient = function() {
'use strict';

initBuildingSpecialContainerLib();

Meteor.subscribe('containers');

Game.Building.special.Container.showWindow = function() {
  Game.Popup.show({ templateName: 'containers' });
};

var isLoading = new ReactiveVar(false);
var rewardUnit = new ReactiveVar(null);

var resetAnimation = function(t) {
  isLoading.set(false);
  rewardUnit.set(null);

  t.$('.take').hide();
  t.$('.title').hide();
  t.$('.open').show();
  t.$('.resources').show();
  t.$('.amount').show();

  t.$('.top').css('top', '214px');
  t.$('.bottom').css('top', '294px');
  t.$('.container')
    .css('top', '294px')
    .css('height', '0px');
};

var startAnimation = function(t) {
  t.$('.open').hide();
  t.$('.resources').hide();
  t.$('.amount').hide();

  var duration = 1000;
  t.$('.top').animate({ top: '0px' }, duration);
  t.$('.bottom').animate({ top: '454px' }, duration);
  t.$('.container').animate({ top: '74px', height: '428px'}, duration, function() {
    t.$('.take').show();
    t.$('.title').show();
  });
};

Template.containers.helpers({
  isLoading: function() {
    return isLoading.get();
  },

  unit: function() {
    return rewardUnit.get();
  },

  credits: function() {
    return containers['Container/Fleet/Small'].getPrice().credits;
  },

  count: function() {
    return containers['Container/Fleet/Small'].getCount();
  }
});

Template.containers.onRendered(function() {
  resetAnimation(this);
});

Template.containers.events({
  'click .take': function(e, t) {
    if (isLoading.get()) {
      return;
    }
    resetAnimation(t);
    Blaze.remove(t.view);
  },

  'click .open': function(e, t) {
    if (isLoading.get()) {
      return;
    }

    var item = containers['Container/Fleet/Small'];

    if (item.getCount() <= 0 && !item.isEnoughResources()) {
      Notifications.error('Недостаточно средств');
      return;
    }


    isLoading.set(true);
    if (item.getCount() <= 0) {
      Meteor.call('Building/Residential/SpacePort.buyContainer', { id: item.id }, (err) => {
        isLoading.set(false);
        if (err) {
          Notifications.error('Не удалось купить контейнер', err.error);
          return;
        }
      });
    } else {
      Meteor.call('Building/Residential/SpacePort.openContainer', { id: item.id }, (err, profit) => {
        isLoading.set(false);
        if (err) {
          Notifications.error('Не удалось открыть контейнер', err.error);
          return;
        }
        // show reward
        if (profit && profit.units && profit.units) {
          var group = _.keys(profit.units)[0];
          var engName = _.keys(profit.units[group])[0];
          rewardUnit.set(Game.Unit.items.army[group][engName]);
          startAnimation(t);
        }
      });
    }
  }
});

};