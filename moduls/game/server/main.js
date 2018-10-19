import '/imports/modules/Person/server';
import '/imports/modules/Container/server';
import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';
import initSpaceServer from '/imports/modules/Space/server/index';
import initMutualSpaceServer from '/imports/modules/MutualSpace/server/index';
import Reptiles from '/imports/modules/Space/server/reptiles';

import '/imports/modules/Person/server/methods';
import ReminderEmails from '../../../imports/modules/User/server/ReminderEmails';
import JobsCleanup from '../../../imports/modules/Space/server/JobsCleanup';

//BrowserPolicy.framing.allowAll();

if (
  !Meteor.settings.public.domain
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Не указан рабочий домен (см. settings.sample public.domain)',
  );
}

BrowserPolicy.content.allowOriginForAll('*');
BrowserPolicy.content.allowEval('*');
BrowserPolicy.content.allowConnectOrigin("ws:");
BrowserPolicy.content.allowConnectOrigin("wss:");

Game.processId = uuid.new();
Game.PROCESS_TIMEOUT = 300;

// For access to rawBody in routes
Router.configureBodyParsers = function () {
  Router.onBeforeAction(Iron.Router.bodyParser.json({
    type: '*/*',
    verify: function(req, res, buffer) {
      req.rawBody = buffer.toString();
    },
    where: 'server'
  }));
  Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({extended: false}));
};

var ApplicationCollection = new Meteor.Collection('application');

Game.checkIsProcessActive = function(processId) {
  var process = ApplicationCollection.findOne({
    processId: processId
  });
  return process ? true : false;
};

var heartbeat = function() {
  var currentTime = Game.getCurrentTime();
  // update current process
  ApplicationCollection.upsert({
    processId: Game.processId
  }, {
    timestamp: currentTime
  });
  // delete processes older than PROCESS_TIMEOUT
  ApplicationCollection.remove({
    timestamp: { $lt: currentTime - Game.PROCESS_TIMEOUT }
  });
};

heartbeat();
Meteor.setInterval(heartbeat, 5000);


if (Meteor.settings.last) {
  SyncedCron.config({
    log: true,
    collectionName: 'cronHistory',
    utc: true,
    collectionTTL: 604800
  });
}

Meteor.startup(function () {
  initBanHistoryServer();
  initPaymentServer();
  initPromoCodeServer();
  initStatisticServer();
  initResourcesServer();
  initCardsServer();
  initBuildingServer();
  initResearchServer();
  initUnitServer();
  initCosmosServer();
  initEarthServer();
  initHouseServer();
  initMutualServer();
  initMailServer();
  initChatServer();
  initItemsServer();
  initSettingsServer();
  initQuestServer();
  initEntranceRewardServer();
  initBackRewardServer();
  initCheatsServer();
  initDDPLimiter();
  initAllianceServer();
  initWrecksServer();
  ReminderEmails.schedule();
  JobsCleanup.schedule();

  if (Meteor.settings.last) {
    SyncedCron.start();
    initSpaceServer();
  }
  initMutualSpaceServer();
});

Router.route('/legal/:filename?', function() {
  var filename = 'legal.html';
  switch (this.params.filename) {
    case 'agreement':
      filename = 'agreement.html';
      break;
    case 'rules':
      filename = 'rules.html';
      break;
    case 'price':
      filename = 'price.html';
      break;
  }
  this.response.setHeader('Content-Type', 'text/html');
  this.response.end( Assets.getText(filename) );
}, { where: 'server' });

Router.route('/unsubscribe', function() {
  var mail = this.params.query.mail;
  check(mail, String);
  
  var user = Accounts.findUserByEmail(mail);
  if (!user) {
    this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
    this.response.end('Ошибка');
    return;
  }

  for (var i = 0; i < user.emails.length; i++) {
    if (user.emails[i].address == mail) {
      var set = {};
      set['emails.' + i.toString() + '.unsubscribed'] = true;
      Meteor.users.update({
        _id: user._id
      }, {
        $set: set
      });
      break;
    }
  }

  this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
  this.response.end('Вы отписаны');
}, { where: 'server' });

Meteor.methods({
  actualizeGameInfo: function() {
    const user = User.getById();
    User.checkAuth({ user });

    Game.BackReward.getReward();

    Log.method.call(this, { name: 'Actualize', user });

    // Update queue tasks and resources
    var needToCheckAgain = Game.Queue.checkAll();
    if (needToCheckAgain)  {
      Game.Queue.checkAll();
    }

    Reptiles.actualize({ user });
    Game.Planets.actualize();
    Game.Quest.actualize();
    Game.Wrecks.actualize();

    return true;
  },

  getCurrentTime: function () {
    Log.method.call(this, { name: 'getCurrentTime' });
    return {
      now: new Date().valueOf(),
      midnight: Game.getMidnightDate()
    };
  }
});

Meteor.publish('game', function () {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId }, {
      fields: {
        createdAt: 1,
        game: 1,
        username: 1,
        planetName: 1,
        role: 1,
        blocked: 1,
        rating: 1,
        votePowerBonus: 1,
        isChatFree: 1,
        timeLastTournament: 1,
        achievements: 1,
        settings: 1,
        music: 1,
        entranceReward: 1,
        Person: 1,
      },
    });
  }
});

Game.Broadcast.add = function(username, text) {
  Game.Broadcast.Collection.insert({
    text,
    username,
    date: new Date(),
  });
};

Meteor.methods({
  broadcast: function(username, message) {
    const user = User.getById();
    User.checkAuth({ user });

    if (user.role !== 'admin') {
      throw Meteor.Error('Хех :-) Не');
    }

    check(username, String);
    check(message, String);

    Game.Broadcast.add(username, message);
  }
});

Meteor.publish('broadcast', function() {
  return Game.Broadcast.Collection.find({}, { sort: { date: -1 }, limit: 5 });
});
