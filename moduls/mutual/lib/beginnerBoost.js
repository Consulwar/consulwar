initBeginnerBoostLib = function () {
'use strict';

const SEC_PER_DAY = 1000 * 60 * 60 * 24;

let getServerDays = function() {
  let serverDate = new Date(Game.getCurrentServerTime() * 1000);
  return Math.floor((serverDate - Game.SERVER_START_DATE) / SEC_PER_DAY);
};

let getUserDays = function() {
  let userRegisterDate = Meteor.user().createdAt;
  let updatedDate = new Date(Game.Resources.getValue().updated * 1000);
  return Math.floor((updatedDate - userRegisterDate) / SEC_PER_DAY);
};

Game.BeginnerBoost = {
  calculatePower: function (affectName, serverDays = getServerDays(), userDays = getUserDays()) {
    let power = this.calculateGrowth(serverDays) - this.calculateDecrease(userDays);
    let rank = Game.User.getLevel();
    const maxRank = Game.User.getMaxLevel();
    
    power *= (1 - (rank / maxRank));
    return Math.max(0, power) * Game.BeginnerBoost.POWER_UNIT[affectName];
  },

  calculateGrowth: function(days) {
    const growth = Game.BeginnerBoost.GROWTH;
    if (days <= growth.initial.days) {
      return (days / growth.initial.interval) * growth.initial.power;
    } else {
      const growthMax = (growth.initial.days / growth.initial.interval) * growth.initial.power;

      return growthMax + ((days - growth.initial.days) / growth.continuous.interval) *
        growth.continuous.power;
    }
  },

  calculateDecrease: function(days) {
    const decrease = Game.BeginnerBoost.DECREASE;
    if (days <= decrease.initial.days) {
      return (days / decrease.initial.interval) * decrease.initial.power;
    } else {
      const decreaseMax = (decrease.initial.days / decrease.initial.interval) * decrease.initial.power;

      return decreaseMax + ((days - decrease.initial.days) / decrease.continuous.interval) *
        decrease.continuous.power;
    }
  }
};

};