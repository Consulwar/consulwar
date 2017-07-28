initBanHistoryServer = function() {
'use strict';

Game.BanHistory = {
  type: {
    account: 0,
    mail: 1,
    chat: 2
  },

  Collection: new Meteor.Collection('banHistory')
};

};