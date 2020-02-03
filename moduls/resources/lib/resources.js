import IncomeEffect from '/imports/modules/Effect/lib/IncomeEffect';

initResourcesLib = function() {
'use strict';

Game.Resources = {
  Collection: new Meteor.Collection('resources'),

  bonusStorage: 6,

  getValue: function({
    user,
    userId = user ? user._id : Meteor.userId(),
  } = {}) {
    return Game.Resources.Collection.findOne({ user_id: userId });
  },

  /**
   * income - общая добыца
   * deltaT - количество секунд
   * uncountedSeconds - бонусные секунды
   */
  calculateFinalAmount: function(baseAmount = 0, income = 0, deltaT = 0, oldLeftover = 0, bonus = false) {
    var result = Game.Resources.calculateProduction(income, deltaT, oldLeftover, bonus);

    result.amount += baseAmount;
    if (bonus) {
      result.bonus = Math.max(Math.min(result.bonus + bonus, income * Game.Resources.bonusStorage), 0);
    }

    return result;
  },

  calculateProduction: function(income = 0, deltaT = 0, oldLeftover = 0, halfToBonus = false) {

    var interval = 3600 * (halfToBonus ? 2 : 1);

    let amount = income * deltaT / interval + oldLeftover;
    const leftover = amount - Math.trunc(amount);
    amount = Math.trunc(amount);

    const result = {
      amount,
      leftover,
    };
    if (halfToBonus) {
      result.bonus = amount;
    }
    return result;
  },

  getIncome: function(options) {
    return IncomeEffect.getValue(options);
  },

  calculateTimeFromResources(resources) {
    const rating = Game.Resources.calculateRatingFromResources(resources);
    return Math.max(Math.floor(rating / 0.12), 2);
  },

  calculateRatingFromResources: function(resources) {
    var rating = 0;

    rating += ((resources.metals) || 0);
    rating += ((resources.crystals * 3) || 0);
    rating += ((resources.humans * 4) || 0);
    rating += ((resources.honor * 0.5) || 0);
    rating += ((resources.credits * 1) || 0);

    return Math.floor(rating / 2);
  },

  calculateHonorFromResources: function(resources) {
    var honor = 0;

    honor += ((resources.metals) || 0) * 10;
    honor += ((resources.crystals * 3) || 0) * 10;
    honor += ((resources.humans * 4) || 0) * 5;

    return Math.floor(honor / 150);
  },

  calculateHonorFromReinforcement: function(resources) {
    return Math.floor(Game.Resources.calculateHonorFromResources(resources) * 0.5);
  },

  calculateHonorFromMutualResearch: function(resources) {
    return Math.floor(Game.Resources.calculateHonorFromResources(resources) * 0.375);
  },

  has({
    resources,
    user,
    userId = user ? user._id : Meteor.userId(),
    availableResources = Game.Resources.getValue({ userId }),
  }) {
    if (!availableResources) {
      return false;
    }

    return !_(resources).pairs().some(([resourceName, amount]) => {
      if (
           resourceName !== 'time'
        && (!availableResources[resourceName] || availableResources[resourceName].amount < amount)
      ) {
        return true;
      }
      return false;
    });
  },

  multiplyResources({ resources, count }) {
    return _.mapObject(resources, resource => resource * count);
  }
};

};