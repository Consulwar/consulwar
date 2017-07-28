initDDPLimiter = function() {
'use strict';

if (!Meteor.settings.ddplimiter || !Meteor.settings.ddplimiter.isEnabled) {

  console.log('DDP Limiter выключен!');

} else {

  if (!Meteor.settings.ddplimiter.numRequests || !Meteor.settings.ddplimiter.timeInterval) {
    throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DDPLimiter (см. settings.sample ddplimiter)');
  }

  var IS_DEBUG = Meteor.settings.ddplimiter.isDebug;
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

  DDPRateLimiter.addRule({
    type: 'method',
    name: function(methodName) {
      if (IS_DEBUG) {
        console.log('method:', methodName);
      }
      return true;
      // Only for methods in array
      // return HEAVY_METHODS.indexOf(methodName) != -1;
    },
    userId: function(userId) {
      if (IS_DEBUG) {
        console.log('userId:', userId);
      }
      return true;
    },
    clientAddress: function(address) {
      if (IS_DEBUG) {
        console.log('ip:', address);
      }
      return true;
    }
  }, NUM_REQUESTS, TIME_INTERVAL);

}

};