initMarketLib = function() {
	
Game.Market = {
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
		if (!Game.Market.exchangeRates[resourceFrom]
		 || !Game.Market.exchangeRates[resourceFrom][resourceTo]
		) {
			return 0;
		}

		var level = Game.Building.items.residential.tradingport
			? Game.Building.items.residential.tradingport.currentLevel()
			: 0;

		// can't change if no tradingport
		if (level === 0) {
			return 0;
		}

		var rate = Game.Market.exchangeRates[resourceFrom][resourceTo];
		return rate + (1 - rate) / 200 * level; // + 0.5% each tradingport level
	},

	getExchangeAmount: function(resourceFrom, resourceTo, amount) {
		return Math.floor( Game.Market.getExchangeRate(resourceFrom, resourceTo) * amount );
	}
};

};