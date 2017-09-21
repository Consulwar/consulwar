initPromoCodeServer = function() {
'use strict';

/*
{
  code: 'pewpew11',

  maxActivations: 42, // not required
                      // if not specified, then only 1 activation

  validthru: timestamp, // not required

  validPeriod: seconds, // not required

  type: string, // not required
                // once:#type - give this type once per user (examples once:votePower, once:startBonus etc.)

  profit: { // if profit = 'random', then selects random item from Game.PromoCode.randomItems
    resources: {
      credits: 100,
      humans: 40,
      ...
    },
    units: {
      fleet: {
        wasp: 10,
        ...
      },
      ground: {
        fathers: 42,
        ...
      },
      ...
    },
    cards: {
      uncleBuilder: 1,
      ...
    },
    houseItems: {
      tron: {
        gameofthrones: 1,
        ...
      },
      ...
    },
    containers: {
      defaultContainer: 1,
      ...
    },
    votePower: 5
  }
}

Examples:
Meteor.call('admin.addPromoCode', { code: 'testCard', profit: { cards: { uncleBuilder: 2 } } } );
Meteor.call('admin.addPromoCode', { code: 'testItem', profit: { houseItems: { tron: { gameofthrones: 1} } } } );
Meteor.call('admin.addPromoCode', { code: 'testRand', profit: 'random' );
Meteor.call('admin.addPromoCode', { code: 'testOnce', profit: { resources: { credits: 1 } }, type: 'once:test' );

*/

Game.PromoCode = {
  Collection: new Meteor.Collection('promoCodes')
};

Game.PromoCode.Collection._ensureIndex({
  code: 1
});

Game.PromoCode.History = {
  Collection: new Meteor.Collection('promoCodesHistory')
};

Game.PromoCode.History.Collection._ensureIndex({
  user_id: 1
});

Game.PromoCode.randomItems =  [{
  resources: { metals: 500, crystals: 150 }
}, {
  resources: { credits: 100 }
}, {
  resources: { honor: 25 }
}, {
  units: { fleet: { wasp: 30 } }
}, {
  units: { fleet: { mirage: 15 } }
}, {
  units: { defense: { bomb: 150 } }
}, {
  units: { defense: { turret: 20 } }
}, {
  units: { ground: { horizontalbarman: 50 } }
}, {
  units: { ground: { agmogedcar: 5 } }
}, {
  units: { ground: { fast: 5 } }
}];

Meteor.methods({
  'admin.getPromocodeHistory': function(options) {
    var user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method('admin.getPromocodeHistory');

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    check(options, Object);
    check(options.page, Match.Integer);
    check(options.count, Match.Integer);

    if (options.count > 100) {
      throw new Meteor.Error('Много будешь знать – скоро состаришься');
    }

    var records = null;
    var count = 0;

    if (options.username) {

      check(options.username, String);
      var target = Meteor.users.findOne({
        username: options.username
      });

      if (!target) {
        throw new Meteor.Error('Такого пользователя не существует');
      }

      records = Game.PromoCode.History.Collection.find({
        user_id: target._id
      }, {
        sort: {
          timestamp: -1
        },
        skip: options.page > 1 ? (options.page - 1) * options.count : 0,
        limit: options.count
      }).fetch();

      count = Game.PromoCode.History.Collection.find({
        user_id: target._id
      }).count();

    } else {

      var conditions = {};
      if (options.code) {
        check(options.code, String);
        conditions.code = options.code;
      }

      records = Game.PromoCode.Collection.find(conditions, {
        sort: {
          timestamp: -1
        },
        skip: options.page > 1 ? (options.page - 1) * options.count : 0,
        limit: options.count
      }).fetch();

      count = Game.PromoCode.Collection.find(conditions).count();

    }

    return {
      records: records,
      count: count
    };
  },

  'admin.addPromoCode': function(options) {
    var user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method('admin.addPromoCode');

    if (['admin'].indexOf(user.role) == -1) {
      throw new Meteor.Error('Zav за тобой следит, и ты ему не нравишься.');
    }

    // check reauired options
    check(options, Object);

    if (!options.code) {
      throw new Meteor.Error('Не задано поле code');
    }

    check(options.code, String);

    if (Game.PromoCode.Collection.findOne({
      code: options.code
    })) {
      throw new Meteor.Error('Такой код уже существует');
    }

    if (!options.profit) {
      throw new Meteor.Error('Не задано поле profit');
    }

    var isProfitOk = true;

    if (_.isObject(options.profit)) {
      if (
          !options.profit.resources
       && !options.profit.units
       && !options.profit.votePower
       && !options.profit.cards
       && !options.profit.containers
       && !options.profit.houseItems
      ) {
        isProfitOk = false;
      }
    } else if (_.isString(options.profit)) {
      if (options.profit.indexOf('random') !== 0) {
        isProfitOk = false;
      }
    }

    if (!isProfitOk) {
      throw new Meteor.Error('Неправильно заполнено поле profit');
    }

    var promoCode = {
      code: options.code,
      profit: options.profit,
      activations: 0,
      timestamp: Game.getCurrentTime()
    };

    // check not required options
    if (options.maxActivations) {
      check(options.maxActivations, Match.Integer);
      promoCode.maxActivations = options.maxActivations;
    } else {
      promoCode.maxActivations = 1;
    }

    if (options.validthru) {
      check(options.validthru, Match.Integer);
      promoCode.validthru = options.validthru;
    } else if (options.validPeriod) {
      check(options.validPeriod, Match.Integer);
      promoCode.validthru = Game.getCurrentTime() + options.validPeriod;
    }

    if (options.type) {
      check(options.type, String);
      promoCode.type = options.type;
    }

    // insert code
    Game.PromoCode.Collection.insert(promoCode);

    // increment statistic
    Game.Statistic.incrementGame({
      'promocode.total': 1
    });
  },

  'user.activatePromoCode': function(code) {
    var user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    Game.Log.method('user.activatePromoCode');

    check(code, String);

    var promoCode = Game.PromoCode.Collection.findOne({
      code: code
    });

    if (!promoCode) {
      throw new Meteor.Error('Такого кода не существует');
    }

    if (promoCode.validthru && promoCode.validthru < Game.getCurrentTime()) {
      throw new Meteor.Error('Срок использования истёк');
    }

    if (promoCode.usersActivated) {
      if (promoCode.usersActivated.indexOf(user._id) != -1) {
        throw new Meteor.Error('Вы уже активировали этот код');
      }

      if (
          !promoCode.maxActivations
       ||  promoCode.maxActivations <= promoCode.usersActivated.length
      ) {
        throw new Meteor.Error('Такой код уже активирован другими игроками');
      }
    }

    // check promo code type options
    if (promoCode.type) {
      if (promoCode.type.indexOf('once') === 0) {
        var count = Game.PromoCode.History.Collection.find({
          user_id: user._id,
          type: promoCode.type
        }).count();

        if (count > 0) {
          throw new Meteor.Error('Вы не можете активировать этот промокод');
        }
      }
    }

    var updateCount = Game.PromoCode.Collection.update({
      code: code,
      activations: { $lt: promoCode.maxActivations },
      usersActivated: { $ne: user._id }
    }, {
      $inc: { activations: 1 },
      $addToSet: { usersActivated: user._id }
    });

    if (updateCount === 0) {
      throw new Meteor.Error('Код уже активирован');
    }

    // generate random profit
    var profit = promoCode.profit;

    if (_.isString(profit) && profit.indexOf('random') === 0) {
      var items = Game.PromoCode.randomItems;
      profit = items[ Game.Random.interval(0, items.length - 1) ];
    }

    // add profit
    if (profit) {
      Game.Resources.addProfit(profit);
      Game.Payment.Income.log(profit, {
        type: 'promo',
        code: promoCode.code
      });
    }

    // insert history record
    Game.PromoCode.History.Collection.insert({
      user_id: user._id,
      code: promoCode.code,
      codeId: promoCode._id,
      type: promoCode.type,
      profit: profit,
      timestamp: Game.getCurrentTime()
    });

    // increment statistic
    Game.Statistic.incrementUser(user._id, {
      'promocode.total': 1
    });

    return profit;
  }
});

};