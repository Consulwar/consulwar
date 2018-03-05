import SpecialEffect from '/imports/modules/Effect/lib/SpecialEffect';

let tradingPortBuilding;
if (Meteor.isClient) {
  tradingPortBuilding = require('/imports/content/Building/Residential/client/TradingPort').default;
} else {
  tradingPortBuilding = require('/imports/content/Building/Residential/server/TradingPort').default;
}

initBuildingSpecialMarketLib = function() {
'use strict';
  
Game.Building.special.Market = {
  exchangeRates: {
    humans:{
      metals: (4 / 1) / 4,
      crystals: (4 / 3) / 4
    },
    metals: {
      humans: (1 / 4) / 4,
      crystals: (1 / 3) / 4
    },
    crystals: {
      humans: (3 / 4) / 4,
      metals: (3 / 1) / 4
    }
  },

  getExchangeRate: function(resourceFrom, resourceTo) {
    if (!Game.Building.special.Market.exchangeRates[resourceFrom]
     || !Game.Building.special.Market.exchangeRates[resourceFrom][resourceTo]
    ) {
      return 0;
    }

    var level = tradingPortBuilding.getCurrentLevel();
    
    if (level === 0) {
      return 0; // can't change if no tradingport
    }

    return Game.Building.special.Market.exchangeRates[resourceFrom][resourceTo];
  },

  getExchangeAmount: function(resourceFrom, resourceTo, amount) {
    amount = SpecialEffect.applyTo({
      target: { id: 'Unique/tradingBonus' },
      obj: { amount: amount * Game.Building.special.Market.getExchangeRate(resourceFrom, resourceTo) },
      hideEffects: true,
    }).amount;

    return Math.floor(amount);
  }
};

};