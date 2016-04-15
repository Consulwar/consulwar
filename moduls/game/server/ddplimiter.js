initDDPLimiter = function() {

var HEAVY_METHODS = [
	'actualizeGameInfo',
	'getBonusResources',
	'building.build',
	'research.start',
	'unit.build',
	'mutual.invest',
	'house.buyItem',
	'cards.buy',
	'cards.activate'
];

DDPRateLimiter.addRule({
	type: 'method',
	name: function(methodName) {
		return HEAVY_METHODS.indexOf(methodName) != -1;
	},
	userId: function(userId) {
		return true;
	}
}, 2, 1000);

};