import { Meteor } from "meteor/meteor";

initEarthLib = function() {
'use strict';

Game.Earth = {};

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

  calcMaxHealth: function(userId = Meteor.userId()) {
    var max = 0;
    var zones = Game.EarthZones.getAll().fetch();
    for (var i = 0; i < zones.length; i++) {
      // calc user army
      var userHealth = Game.Unit.calcUnitsHealth(zones[i].userArmy, userId);
      if (userHealth > max) {
        max = userHealth;
      }
      // calc enemy army
      var enemyHealth = Game.Unit.calcUnitsHealth(zones[i].enemyArmy, userId);
      if (enemyHealth > max) {
        max = enemyHealth;
      }
    }
    return max;
  }
};

Game.EarthUnits = {
  Collection: new Meteor.Collection('earthUnits'),

  get: function(user_id = Meteor.userId()) {
    return Game.EarthUnits.Collection.findOne({ user_id });
  },

  getByZoneName(zoneName) {
    return Game.EarthUnits.Collection.find({ zoneName });
  },
};

initEarthConfigLib();

};