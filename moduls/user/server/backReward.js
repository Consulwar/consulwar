initBackRewardServer = function() {

game.BackReward = function(options) {

  _.extend(this, options);

  Game.BackReward.default = this;

};


Game.BackReward.getProfit = function() {
  let backTime = (+ new Date() - Game.Statistic.getUserValue('update')) * 0.001;
  let Rewards = Game.Cards.items['backReward'];
  let reward;

  for (var key in Rewards) {
    let r = Rewards[key];
    let fromDay = r.fromDay * 24 * 3600;
    if ((fromDay *  <= backTime) && (!reward || (reward.fromDay * 24 * 3600 < fromDay))) {
      reward = r;
    }
  }

  if (reward) {
    if (_.isString(reward.profit)) {
      let rewards = Game.EntranceReward.ranks[reward.profit].rewards;
      return Game.Resources.rollProfit(rewards);
    } else {
      return reward.profit;
    }
  } else {
    return null;
  }
};

Meteor.methods({
  // TODO: add cache system on frontend to load only necessary data

  'backReward.takeReward': function() {
    let user = Meteor.user();

    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }

    let profit = Game.BackReward.getProfit();

    if (profit) {
      Game.Resources.addProfit(profit);
      return profit;
    }
  }
});

initBackRewardsContent();

};