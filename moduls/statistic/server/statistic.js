import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initStatisticServer = function() {
'use strict';

initStatisticLib();

Game.Statistic.Collection._ensureIndex({
  user_id: 1
});

Meteor.users._ensureIndex({
  rating: 1
});

Meteor.users._ensureIndex({
  'emails.unsubscribed': 1,
  'status.online': 1,
  'status.lastLogout': 1,
  lastReminderDate: 1,
  reminderLevel: 1,
});

Game.Statistic.Collection._ensureIndex({
  'research.total': 1
});

Game.Statistic.Collection._ensureIndex({
  'chat.messages': 1
});

Game.Statistic.Collection._ensureIndex({
  'reinforcements.sent.total': 1
});

Game.Statistic.Collection._ensureIndex({
  'resources.gained.honor': 1
});

Game.Statistic.Collection._ensureIndex({
  'battle.krampus.1.victory': 1
});

Game.Statistic.Collection._ensureIndex({
  'battle.krampussy.1.victory': 1
});

Game.Statistic.initialize = function(user) {
  var statistic = Game.Statistic.Collection.findOne({
    user_id: user._id
  });

  if (!statistic) {
    Game.Statistic.Collection.insert({
      user_id: user._id,
      username: user.username
    });
  }
};

Game.Statistic.incrementUser = function(uid, increment) {
  Game.Statistic.Collection.update({
    user_id: uid
  }, {
    $inc: increment
  });
};

Game.Statistic.incrementGroupUserIds = function(uidList, increment) {
  Game.Statistic.Collection.update({
    user_id: {$in: uidList}
  }, {
    $inc: increment
  }, {
    multi: true
  });
};

Game.Statistic.incrementGroupUserNames = function(namesList, increment) {
  Game.Statistic.Collection.update({
    username: {$in: namesList}
  }, {
    $inc: increment
  }, {
    multi: true
  });
};

Game.Statistic.incrementAllUsers = function(increment) {
  var bulkOp = Game.Statistic.Collection.rawCollection().initializeUnorderedBulkOp();
  bulkOp.find({ user_id: { $ne: 'system' } }).update({ $inc: increment });
  bulkOp.execute(function(err, data) {});
};

Game.Statistic.incrementGame = function(increment) {
  Game.Statistic.Collection.upsert({
    user_id: 'system'
  }, {
    $inc: increment
  });
};

Game.Statistic.getUserPositionInRating = function(type, user) {
  let position;
  let total;
  let sortField = Game.Statistic.getSortFieldForType(type).field;

  if (type === "general") {
    position = Meteor.users.find({
      rating: { $gt: user.rating }
    }).count();

    total = Meteor.users.find({
      rating: { $gt: 0 }
    }).count();
  } else {
    let fields = {};
    fields[sortField] = 1;

    let selector = {};
    selector[sortField] = {
      $gt: Game.Statistic.getUserValue(
        sortField,
        Game.Statistic.Collection.findOne({
          user_id: user._id
        }, {
          fields: fields
        })
      )
    };

    position = Game.Statistic.Collection.find(selector).count();

    selector[sortField] = {
      $gt: 0
    };

    total = Game.Statistic.Collection.find(selector).count();
  }

  return {
    total,
    position: position + 1
  };
};

Meteor.methods({
  'statistic.getUserPositionInRating': function(type, selectedUserName) {
    const user = User.getById();
    User.checkAuth({ user });

    check(selectedUserName, String);
    check(type, String);
    
    var selectedUser = Meteor.users.findOne({
      username: selectedUserName
    }, {
      fields: { rating: 1 }
    });
      
    if (!selectedUser) {
      throw new Meteor.Error('Пользователя с именем ' + selectedUserName + ' не существует');
    }
    
    Log.method.call(this, { name: 'statistic.getUserPositionInRating', user });

    return Game.Statistic.getUserPositionInRating(type, selectedUser);
  },

  'statistic.getPageInRating': function(type, page, countPerPage) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'statistic.getPageInRating', user });

    check(page, Match.Integer);
    check(countPerPage, Match.Integer);
    check(type, String);

    if (countPerPage > Game.Statistic.COUNT_PER_PAGE) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    var sortField = Game.Statistic.getSortFieldForType(type).field;
    var result;

    if (type == "general") {
      result = Meteor.users.find({
        rating: { $gt: 0 }
      }, {
        fields: {
          username: 1,
          rating: 1
        },
        sort: {rating: -1},
        skip: (page > 0) ? (page - 1) * countPerPage : 0,
        limit: countPerPage
      });
    } else {
      var selector = {};
      selector[sortField] = { $gt: 0 };

      var fields = {
        username: 1
      };
      fields[sortField] = 1;

      var sort = {};
      sort[sortField] = -1;

      result = Game.Statistic.Collection.find(selector, {
        fields: fields,
        sort: sort,
        skip: (page > 0) ? (page - 1) * countPerPage : 0,
        limit: countPerPage
      });
    }

    return {
      users: result.fetch(),
      count: result.count()
    };
  },

  'statistic.getUserStatistic': function(userName) {
    const user = User.getById();
    User.checkAuth({ user });

    check(userName, String);

    var selectedUser = Meteor.users.findOne({username: userName});
    
    if (!selectedUser || !selectedUser._id) {
      throw new Meteor.Error('Пользователь не найден');
    }


    var statistic = Game.Statistic.Collection.findOne({
      user_id: selectedUser._id
    }, {
      fields: {
        user_id: 1,
        resources: 1,
        building: 1,
        research: 1,
        quests: 1,
        units: 1,
        reptiles: 1,
        reinforcements: 1,
        cosmos: 1,
        battle: 1,
        chat: 1,
        mail: 1,
        investments: 1,
        colosseum: 1,
        promocode: 1
      }
    });

    if (statistic.resources.spent) {
      delete statistic.resources.spent.credits;
      delete statistic.resources.spent.total;
    }
    if (statistic.resources.gained) {
      delete statistic.resources.gained.credits;
      delete statistic.resources.gained.total;
    }
    if (statistic.investments) {
      delete statistic.investments.credits;
      delete statistic.investments.total;
    }

    return statistic;
  },

  'statistic.getUserInfo': function(userName) {
    const user = User.getById();
    User.checkAuth({ user });

    check(userName, String);

    var userInfo = Meteor.users.findOne({
      username: userName
    }, {
      fields: {
        rating: 1,
        username: 1,
        achievements: 1,
        'settings.chat.icon': 1,
        createdAt: 1,
        'status.lastLogin.date': 1,
        votePowerBonus: 1
      }
    });

    if (!userInfo || !userInfo._id) {
      throw new Meteor.Error('Пользователь не найден');
    }

    return userInfo;
  }
});

Meteor.publish('statistic', function() {
  if (this.userId) {

    var user = Meteor.users.findOne({ _id: this.userId });
    var isAdmin = user && ['admin', 'helper'].indexOf(user.role) >= 0;

    if (isAdmin) {
      return Game.Statistic.Collection.find({
        $or: [
          { user_id: this.userId },
          { user_id: 'system' }
        ]
      });
    } else {
      return Game.Statistic.Collection.find({
        $or: [
          { user_id: this.userId },
          { user_id: 'system' }
        ]
      }, {
        fields: {
          user_id: 1,
          resources: 1,
          building: 1,
          research: 1,
          cards: 1,
          quests: 1,
          units: 1,
          reptiles: 1,
          reinforcements: 1,
          cosmos: 1,
          battle: 1,
          chat: 1,
          mail: 1,
          payment: 1,
          investments: 1,
          promocode: 1,
          colosseum: 1,
          entranceReward: 1
        }
      });
    }
  }
});

initStatisticAchievementsServer();

};