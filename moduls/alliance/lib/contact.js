initAllianceContactLib = function() {
'use strict';

Game.Alliance.Contact = {
  Collection: new Meteor.Collection('alliance_contacts'),

  status: {
    SENT: 0,
    INVALIDATED: 1,
    ACCEPTED: 2,
    DECLINED: 3
  },

  type: {
    INVITE: 0,
    REQUEST: 1
  }
};

};