initGameLog = function() {
'use strict';

initDataDog();

Game.Log = function(desc, info = Meteor.user().username) {
	console.log(desc + ':', new Date(), info);

	Game.datadog.increment(desc);
};
};