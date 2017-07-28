initAllianceContactServer = function() {
'use strict';

initAllianceContactLib();
initAllianceContactServerMethods();

Game.Alliance.Contact.Collection._ensureIndex({
  username: 1,
  type: 1,
  timestamp: -1
});

Game.Alliance.Contact.Collection._ensureIndex({
  username: 1,
  alliance_id: 1,
  type: 1,
  timestamp: -1
});

Game.Alliance.Contact.Collection._ensureIndex({
  status: 1,
  timestamp: -1
});

Game.Alliance.Contact.Collection._ensureIndex({
  user_id: 1,
  status: 1
});

Game.Alliance.Contact.Collection._ensureIndex({
  status: 1
});

Game.Alliance.Contact.Collection._ensureIndex({
  alliance_id: 1,
  type: 1,
  status: 1,
  timestamp: 1
});



Game.Alliance.Contact.INVALIDATE_TIMEOUT = 3 * 24 * 60 * 60;
Game.Alliance.Contact.DECLINE_TIMEOUT = 30 * 24 * 60 * 60;

Game.Alliance.Contact.create = function(alliance, user, type) {
  Game.Alliance.Contact.Collection.insert({
    username: user.username,
    user_id: user._id,
    alliance_id: alliance._id,
    type: type,
    status: Game.Alliance.Contact.status.SENT,
    timestamp: Game.getCurrentTime()
  });

  if (type === Game.Alliance.Contact.type.INVITE) {
    let subject = "Приглашение в альянс " + alliance.name;
    let text = `link to ${alliance.url}`; //TODO текст письма

    game.Mail.addAllianceMessage(alliance.name, user, subject, text);
  }
};

Game.Alliance.Contact.checkForInvalidatingAll = function() {
  let invalidates = Game.Alliance.Contact.Collection.find({
    status: Game.Alliance.Contact.status.SENT,
    timestamp: {$lte: Game.getCurrentTime() - Game.Alliance.Contact.INVALIDATE_TIMEOUT}
  }).fetch();

  let uidIgnoredList = [];
  for (let contact of invalidates) {
    if (contact.type === Game.Alliance.Contact.type.INVITE) {
      uidIgnoredList.push(contact.user_id);
    }
  }

  Game.Statistic.incrementGroupUserIds(uidIgnoredList, {
    'alliance_contact.ignored_invites': 1
  });

  let uidIgnoringList = [];
  for (let contact of invalidates) {
    if (contact.type === Game.Alliance.Contact.type.REQUEST) {
      uidIgnoringList.push(contact.user_id);
    }
  }

  Game.Statistic.incrementGroupUserIds(uidIgnoringList, {
    'alliance_contact.ignored_requests': 1
  });

  Game.Alliance.Contact.Collection.update({
    _id: {$in: invalidates.map(contact => contact._id)}
  }, {
    $set: {
      status: Game.Alliance.Contact.status.INVALIDATED
    }
  }, {
    multi: true
  });
};

Game.Alliance.Contact.invalidateForUser = function(userId) {
  Game.Alliance.Contact.Collection.update({
    user_id: userId,
    status: Game.Alliance.Contact.status.SENT
  }, {
    $set: {
      status: Game.Alliance.Contact.status.INVALIDATED
    }
  }, {
    multi: true
  });
};

Game.Alliance.Contact.get = function(id) {
  return Game.Alliance.Contact.Collection.findOne({
    _id: id,
    status: Game.Alliance.Contact.status.SENT
  });
};

Game.Alliance.Contact.find = function(user, type, alliance) {
  let selector = {
    username: user.username,
    type: type
  };

  let fields = {
    username: 1,
    status: 1
  };

  if (type === Game.Alliance.Contact.type.INVITE) {
    selector.alliance_id = alliance._id;
  } else {
    fields.alliance_id = 1;
    fields.timestamp = 1;
  }

  return Game.Alliance.Contact.Collection.findOne(selector, {
    fields: fields,
    sort: {timestamp: -1}
  });
};

Game.Alliance.Contact.set = function(id, isAccept) {
  return Game.Alliance.Contact.Collection.update({
    _id: id,
    status: Game.Alliance.Contact.status.SENT
  }, {
    $set: {
      status: (isAccept ? Game.Alliance.Contact.status.ACCEPTED : Game.Alliance.Contact.status.DECLINED)
    }
  });
};

Game.Alliance.Contact.accept = function(contactId) {
  return Game.Alliance.Contact.set(contactId, true);
};

Game.Alliance.Contact.decline = function(contactId) {
  return Game.Alliance.Contact.set(contactId, false);
};

SyncedCron.add({
  name: 'Инвалидация устаревших запросов в альянсы',
  schedule: function(parser) {
    return parser.text(Game.Alliance.INVALIDATE_SCHEDULE);
  },
  job: function() {
    Game.Alliance.Contact.checkForInvalidatingAll();
  }
});

Meteor.publish('alliance_contact_requests', function () {
  if (this.userId) {
    let user = Meteor.users.findOne({ _id: this.userId });
    if (user.alliance) {
      let alliance = Game.Alliance.getByName(user.alliance);

      if (alliance.owner === user.username) {
        return Game.Alliance.Contact.Collection.find({
          alliance_id: alliance._id,
          type: Game.Alliance.Contact.type.REQUEST,
          status: Game.Alliance.Contact.status.SENT
        }, {
          fields: {
            username: 1,
            timestamp: 1
          },
          sort: {timestamp: 1}
        });
      }
    }
  }

  this.ready();
});


};