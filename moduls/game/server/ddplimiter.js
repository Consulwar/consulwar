initDDPLimiter = function() {

if (!Meteor.settings.ddplimiter
 ||  Meteor.settings.ddplimiter.isEnabled === undefined
 || !Meteor.settings.ddplimiter.numRequests
 || !Meteor.settings.ddplimiter.timeInterval
) {
	throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DDPLimiter (см. settings.sample ddplimiter)');
}

var IS_ENABLED = Meteor.settings.ddplimiter.isEnabled;
var NUM_REQUESTS = Meteor.settings.ddplimiter.numRequests;
var TIME_INTERVAL = Meteor.settings.ddplimiter.timeInterval;

var HEAVY_METHODS = [
	'actualizeGameInfo',
	'getBonusResources',
	'building.build',
	'research.start',
	'unit.build',
	'mutual.invest',
	'house.buyItem',
	'cards.buy',
	'cards.activate',
	'chat.sendMessage'
];

if (IS_ENABLED) {
	DDPRateLimiter.addRule({
		type: 'method',
		name: function(methodName) {
			return true;
			// Only for methods in array
			// return HEAVY_METHODS.indexOf(methodName) != -1;
		},
		userId: function(userId) {
			return true;
		}
	}, NUM_REQUESTS, TIME_INTERVAL);
}

};