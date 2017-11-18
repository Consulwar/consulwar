import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initPaymentServer = function() {
'use strict';

initPaymentLib();

initPaymentTekoServer();

Game.Payment.Expense = {
  Collection: new Meteor.Collection('paymentExpense')
};

Game.Payment.Transactions = {
  Collection: new Meteor.Collection('paymentTransactions')
};

Game.Payment.Income.Collection._ensureIndex({
  user_id: 1
});

Game.Payment.Expense.Collection._ensureIndex({
  user_id: 1
});

Game.Payment.Transactions.Collection._ensureIndex({
  user_id: 1
});

Game.Payment.Income.log = function(profit, source, uid) {
  var record = {
    user_id: uid ? uid : Meteor.userId(),
    profit: profit,
    timestamp: Game.getCurrentTime()
  };

  if (source) {
    record.source = source;
  }

  Game.Payment.Income.Collection.insert(record);

  // update user statistics
  Game.Statistic.incrementUser(record.user_id, {
    'payment.income': 1
  });
};

Game.Payment.Expense.log = function(credits, type, info, uid) {
  var userId = uid ? uid : Meteor.userId();

  // prepare expense item
  var item = {
    credits: credits,
    timestamp: Game.getCurrentTime()
  };

  if (info) {
    item.info = info;
  }

  // upsert document
  var result = Game.Payment.Expense.Collection.upsert({
    user_id: userId,
    type: type,
    timeCreated: { $gt: Game.getCurrentTime() - 86400 }
  }, {
    $setOnInsert: {
      user_id: userId,
      type: type,
      timeCreated: Game.getCurrentTime()
    },
    $set: {
      timeUpdated: Game.getCurrentTime()
    },
    $inc: {
      credits: credits
    },
    $push: {
      items: item
    }
  });

  // update user statistics
  if (result.insertedId) {
    Game.Statistic.incrementUser(userId, {
      'payment.expense': 1
    });
  }
};

Meteor.methods({
  'user.getPaymentIncomeHistory': function(page, count) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'user.getPaymentIncomeHistory', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    return Game.Payment.Income.Collection.find({
      user_id: user._id
    }, {
      sort: {
        timestamp: -1
      },
      skip: page > 1 ? (page - 1) * count : 0, 
      limit: count
    }).fetch();
  },

  'user.getPaymentExpenseHistory': function(page, count) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'user.getPaymentIncomeHistory', user });

    if (count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    return Game.Payment.Expense.Collection.find({
      user_id: user._id
    }, {
      sort: {
        timeUpdated: -1
      },
      skip: page > 1 ? (page - 1) * count : 0, 
      limit: count
    }).fetch();
  }
});

Meteor.publish('paymentIncome', function() {
  if (this.userId) {
    return Game.Payment.Income.Collection.find({
      user_id: this.userId
    }, {
      limit: 1,
      sort: {
        timestamp: -1
      }
    });
  } else {
    this.ready();
  }
});

};