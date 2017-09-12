initSquadLib = function() {
'use strict';

Game.Squad = {

  Collection: new Meteor.Collection('squad'),

  config: {
    slots: {
      total: 9,
      free: 3
    }
  },

  getAll: function() {
    return Game.Squad.Collection.find({
      user_id: Meteor.userId()
    });
  },

  getOne: function(slot) {
    return Game.Squad.Collection.findOne({
      user_id: Meteor.userId(),
      slot
    });
  }
};

};