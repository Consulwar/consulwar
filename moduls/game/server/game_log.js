initGameLog = function() {
'use strict';

initDataDog();

Game.Log = function(desc, info = Meteor.user().username) {
	console.log(new Date() + ' ' + info + ': ' + desc);

	Game.datadog.increment(desc);
};
};