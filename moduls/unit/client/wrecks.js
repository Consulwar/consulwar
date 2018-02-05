initUnitClientWrecks = function() {
'use strict';

initWrecksLib();

Meteor.subscribe('wrecks');

Game.Wrecks.showPopup = function(unit) {
  Game.Popup.show({
    templateName: 'repairWrecks',
    data: { unit },
  });
};

const getWrecksCount = function(unit) {
  const wrecks = Game.Wrecks.Collection.find({ 
    userId: Meteor.userId(),
  }).fetch()[0];

  return (
       wrecks
    && wrecks.units
    && wrecks.units.army
    && wrecks.units.army[unit.group]
    && wrecks.units.army[unit.group][unit.engName]
    && wrecks.units.army[unit.group][unit.engName].count
  ) || 0;
};

Template.repairWrecks.helpers({
  price() {
    return Game.Wrecks.getPrice(this.unit, getWrecksCount(this.unit));
  },

  count() {
    return getWrecksCount(this.unit);
  },
});

Template.repairWrecks.events({
  'click .repair'(event, templateInstance) {
    const unit = templateInstance.data.unit;
    Meteor.call('unit.repair', unit.group, unit.engName, (error) => {
      if (error) {
        Notifications.error('Невозможно восстановить юнитов', error.error);
      } else {
        Notifications.success('Юниты восстановлены');
      }
    });
  },
});

};
