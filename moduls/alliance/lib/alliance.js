initAllianceLib = function() {
'use strict';

Game.Alliance = {
  Collection: new Meteor.Collection('alliances'),

  type: {
    PUBLIC: 0,
    OPEN: 1,
    PRIVATE: 2
  },

  maxParticipantsByLevel: function(level) {
    return level * Game.Alliance.PARTICIPANTS_PER_LEVEL + 1; // +1 for owner
  },

  getAll: function() {
    return Game.Alliance.Collection.find({
      deleted: { $exists: false }
    });
  }
};

initAllianceConfigLib();
};