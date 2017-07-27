initEarthLib = function() {
'use strict';

Game.Earth = {
  checkReinforceTime: function(currentTime) {
    var hours = new Date(currentTime * 1000).getUTCHours();
    return (hours >= 14 && hours < 16) ? false : true;
  }
};

Game.EarthZones = {
  Collection: new Meteor.Collection('zones'),

  getAll: function() {
    return Game.EarthZones.Collection.find();
  },

  getByName: function(name) {
    return Game.EarthZones.Collection.findOne({
      name: name
    });
  },

  getCurrent: function() {
    return Game.EarthZones.Collection.findOne({
      isCurrent: true
    });
  },

  calcMaxHealth: function() {
    var max = 0;
    var zones = Game.EarthZones.getAll().fetch();
    for (var i = 0; i < zones.length; i++) {
      // calc user army
      var userHealth = Game.Unit.calcUnitsHealth( zones[i].userArmy );
      if (userHealth > max) {
        max = userHealth;
      }
      // calc enemy army
      var enemyHealth = Game.Unit.calcUnitsHealth( zones[i].enemyArmy );
      if (enemyHealth > max) {
        max = enemyHealth;
      }
    }
    return max;
  }
};

Game.EarthTurns = {
  Collection: new Meteor.Collection('turns'),

  getLast: function() {
    return Game.EarthTurns.Collection.findOne({}, {
      sort: { timeStart: -1 }
    });
  }
};

initEarthConfigLib();

};