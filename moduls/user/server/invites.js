import Log from '/imports/modules/Log/server/Log';

Meteor.startup(function() {
'use strict';

global.Invites = new Meteor.Collection("invites");

Meteor.methods({
  'user.checkInviteCode': function(code) {
    Log.method.call(this, { name: 'user.checkInviteCode' });

    check(code, String);
    
    var invite = Invites.findOne({code: code});
    if (invite) {
      return invite._id;
    } else {
      return false;
    }
  }
});

});