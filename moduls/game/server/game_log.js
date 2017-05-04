initGameLog = function() {
'use strict';

initDataDog();

Game.Log = function(desc, info = Meteor.user().username) {
	let now = new Date();
	let dateStr = now.getFullYear() + '.' + pad(now.getMonth() + 1) + '.' + pad(now.getDate()) + ' ' +
		pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + '.' +
		pad1000(now.getMilliseconds());

	console.log('[' + dateStr + '] ' + info + ': ' + desc);

	Game.datadog.increment(desc);
};

let pad = function(value) {
	return (value < 10) ? '0' + value : value;
};

let pad1000 = function(value) {
	if (value < 10) {
		return '00' + value;
	} else if (value < 100) {
		return '0' + value;
	} else {
		return value;
	}
};

};