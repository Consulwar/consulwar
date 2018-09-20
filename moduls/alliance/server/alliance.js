initAllianceServer = function() {
'use strict';

initAllianceLib();
initAllianceServerMethods();

Game.Alliance.Collection._ensureIndex({
  name: 1,
  deleted: 1
});

Game.Alliance.Collection._ensureIndex({
  url: 1,
  deleted: 1
});

Game.Alliance.Collection._ensureIndex({
  tag: 1,
  deleted: 1
});

Game.Alliance.Collection._ensureIndex({
  _id: 1,
  deleted: 1
});


Game.Alliance.create = function(user, options) {
  let alliance = {
    owner: user.username,
    name: options.name,
    url: options.url,
    tag: options.tag,
    type: options.type,
    information: options.information,
    level: 1,
    participants: [],
    balance: {
      honor: 0,
      credits: 0
    },
    timestamp: Game.getCurrentTime()
  };

  let id = Game.Alliance.Collection.insert(alliance);

  alliance._id = id;

  Game.Alliance.addParticipant(alliance, user.username);

  return id;
};

Game.Alliance.get = function(id) {
  return Game.Alliance.Collection.findOne({
    _id: id,
    deleted: { $exists: false }
  });
};

Game.Alliance.getByUrl = function(url) {
  return Game.Alliance.Collection.findOne({
    url,
    deleted: { $exists: false }
  });
};

Game.Alliance.getByName = function(name) {
  return Game.Alliance.Collection.findOne({
    name,
    deleted: { $exists: false }
  });
};

Game.Alliance.addParticipant = function(alliance, username) {
  Game.Alliance.Collection.update({
    _id: alliance._id,
    deleted: { $exists: false }
  },{
    $push: {
      participants: username
    }
  });

  Meteor.users.update({
    username: username
  }, {
    $set: {
      alliance: alliance.name
    }
  });
};

Game.Alliance.removeParticipant = function(alliance, username) {
  Game.Alliance.Collection.update({
    _id: alliance._id,
    deleted: { $exists: false }
  },{
    $pull: {
      participants: username
    }
  });

  Meteor.users.update({
    username: username
  }, {
    $unset: {
      alliance: 1
    }
  });
};

Game.Alliance.levelUp = function(alliance) {
  Game.Alliance.Collection.update({
    _id: alliance._id,
    deleted: { $exists: false }
  },{
    $inc: {
      level: 1
    }
  });
};

Game.Alliance.spendResource = function(allianceUrl, resource) {
  let dec = {};

  for (let name in resource) {
    if (resource.hasOwnProperty(name)) {
      dec[`balance.${name}`] = -resource[name];
    }
  }

  Game.Alliance.Collection.update({
    url: allianceUrl,
    deleted: { $exists: false }
  },{
    $inc: dec
  });
};

Game.Alliance.addResource = function(allianceUrl, resource) {
  let inc = {};

  for (let name in resource) {
    if (resource.hasOwnProperty(name)) {
      inc[`balance.${name}`] = resource[name];
    }
  }

  Game.Alliance.Collection.update({
    url: allianceUrl,
    deleted: { $exists: false }
  },{
    $inc: inc
  });
};

Game.Alliance.calculateAllRating = function() {
  let alliances = Game.Alliance.getAll().fetch();

  if (alliances.length === 0) {
    return;
  }

  console.log("Расчет рейтингов альянсов начался:", new Date());

  let alliancesByName = {};
  for (let alliance of alliances) {
    alliancesByName[alliance.name] = alliance;
  }

  let updates = {};

  let users = Meteor.users.find({
    alliance: { $exists: true }
  }).fetch();

  for (let user of users) {
    let allianceName = user.alliance;
    if (!updates[allianceName]) {
      updates[allianceName] = {
        rating: 0,
        ownerPosition: 0
      };
    }

    updates[allianceName].rating += user.rating;

    let alliance = alliancesByName[allianceName];
    if (user.username === alliance.owner) {
      updates[allianceName].ownerPosition = Game.Statistic.getUserPositionInRating('general', user).position;
    }
  }

  let bulkOp = Game.Alliance.Collection.rawCollection().initializeUnorderedBulkOp();

  for (let alliance of alliances) {
    let update = updates[alliance.name];

    bulkOp.find({
      _id: alliance._id
    }).update({
      $set: {
        rating: update.rating,
        owner_position: update.ownerPosition
      }
    });
  }

  bulkOp.execute(function(err, data) {
    if (err) {
      console.log("Расчет рейтингов альянсов завершен с ошибкой:", err, new Date());
    } else {
      console.log("Расчет рейтингов альянсов успешно завершен.", new Date());
    }
  });
};

Game.Alliance.giveCardsForParticipants = function() {
  let alliances = Game.Alliance.getAll().fetch();

  let alliancesByName = {};
  for (let alliance of alliances) {
    alliancesByName[alliance.name] = alliance;
  }

  let users = Meteor.users.find({
    alliance: { $exists: true }
  }).fetch();

  for (let user of users) {
    let alliance = alliancesByName[user.alliance];

    if (alliance.daily_card) {
      Game.Cards.add({[alliance.daily_card]: 1}, user._id);
    }
  }
};

Meteor.publish('myAlliance', function () {
  if (this.userId) {
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user.alliance) {
      return Game.Alliance.Collection.find({
        name: user.alliance,
      }, {
        fields: {
          participants: 1,
        },
      });
    }
  }

  this.ready();
});

if (Meteor.settings.space.jobs.enabled) {
  SyncedCron.add({
    name: 'Расчет рейтинга альянсов и выдача карточек',
    schedule: function(parser) {
      return parser.text(Game.Alliance.UPDATE_SCHEDULE);
    },
    job: function() {
      Game.Alliance.calculateAllRating();
      Game.Alliance.giveCardsForParticipants();
    }
  });
}

initAllianceContactServer();
initAllianceReplenishmentHistoryServer();

};