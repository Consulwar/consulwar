initEntranceRewardServer = function() {
'use strict';

initEntranceRewardLib();

Game.EntranceReward.Collection._ensureIndex({
  user_id: 1
});

game.EntranceReward = function(options) {
  if (options.day === undefined) {
    throw new Meteor.Error('Ошибка в контенте', 'Не указан номер дня награды за вход');
  }

  this.type = (_.isString(options.profit)
    ? 'box'
    : 'unique'
  );

  _.extend(this, options);

  let day = options.day;

  if (_.isNumber(day)) {
    day = [day, day];
  }

  // fill multiple awards if day is array
  if (_.isArray(day)) {
    let from = day[0];
    let to = day[1];
    for (let i = from; i <= to; i++) {
      if (Game.EntranceReward.items[i] !== undefined) {
        throw new Meteor.Error('Ошибка в контенте', 'Награда за вход с номером дня ' + i + ' уже существует');
      }

      if (_.isString(this.profit) && Game.EntranceReward.ranks[this.profit] === undefined) {
        throw new Meteor.Error(
          'Ошибка в контенте', 
          'Отсутствует ранг награды ' + this.profit.rank + ' для награды за вход за день ' + i
        );
      }

      Game.EntranceReward.items[i] = this;
    }
  } else {
    Game.EntranceReward.default = this;
  }
};


Game.EntranceReward.getProfit = function() {
  let nextDay = Game.Statistic.getUserValue('entranceReward.total') + 1;
  let reward = Game.EntranceReward.items[nextDay] || Game.EntranceReward.defaultRewards;

  if (_.isString(reward.profit)) {
    let rewards = Game.EntranceReward.ranks[reward.profit].rewards;
    return Game.Resources.rollProfit(rewards);
  } else {
    return reward.profit;
  }
};

Meteor.methods({
  // TODO: add cache system on frontend to load only necessary data
  'entranceReward.getHistory': function(page = 0) {
    let user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    check(page, Match.Integer);

    let history = Game.EntranceReward.Collection.findOne({
      user_id: Meteor.userId()
    }, {
      fields: {history: {
        $slice: [page * Game.EntranceReward.perPage, Game.EntranceReward.perPage]
      }}
    });

    history = (history && history.history) || [];

    // Count of reward taken on current page
    let rewardsTaken = Game.Statistic.getUserValue('entranceReward.total');
    let currentRewardPage = Math.floor(rewardsTaken / Game.EntranceReward.perPage);

    if (history.length < Game.EntranceReward.perPage) {
      let currentPageReward = currentRewardPage == page ? (rewardsTaken % Game.EntranceReward.perPage) : 0;
      let firstElement = page * Game.EntranceReward.perPage + currentPageReward + 1;
      let lastElement = firstElement + Game.EntranceReward.perPage - currentPageReward;
      
      // take care about references
      let unclaimed = _.map(Game.EntranceReward.items.slice(firstElement, lastElement), _.clone);
      if (currentRewardPage == page) {
        unclaimed[0].state = 'current';
      }
      history.push.apply(history, unclaimed);
    }

    Game.Log.method('entranceReward.getHistory');

    return history;
  },

  'entranceReward.takeReward': function() {
    let user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    let currentDate = Game.getMidnightDate();

    // recently registered users do not have entranceReward field
    // if registered today skip checking awards
    if ((!user.entranceReward && (Game.getMidnightDate(user.createdAt) >= currentDate))
      || (user.entranceReward && (Game.getMidnightDate(user.entranceReward) >= currentDate))) {
      throw new Meteor.Error('Невозможно получить награду за вход', 'награда уже получена');
    }

    let profit = Game.EntranceReward.getProfit();

    let now = new Date();

    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        entranceReward: now
      }
    });

    let record = {
      date: now,
      profit
    };

    Game.EntranceReward.Collection.upsert({
      user_id: user._id
    }, {
      $push: {
        history: record
      }
    });

    Game.Resources.addProfit(profit);

    Game.Statistic.incrementUser(user._id, {
      'entranceReward.total': 1
    });

    return profit;
  }
});

initEntranceRewardsContent();

};