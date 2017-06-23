initGameLog = function() {
'use strict';

initDataDog();

Game.Log = function(desc, info) {
	let dateStr = formatDate();

	console.log('[' + dateStr + '] ' + info + ': ' + desc);

	Game.datadog.increment(desc);
};

Game.Log.increment = function(desc, count) {
	Game.datadog.increment(desc, count);
};

Game.Log.method = function(desc) {
	let user = Meteor.user();

	let dateStr = formatDate();

	let ip = UserStatus.connections.findOne({userId: user._id}).ipAddr;

	console.log('[' + dateStr + '] ' + user.username + ' (' + ip + '): ' + desc);

	Game.datadog.increment('call.' + desc);
};

let formatDate = function(date = new Date()) {
	return date.getFullYear() + '.' + pad(date.getMonth() + 1) + '.' + pad(date.getDate()) + ' ' +
		pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + '.' +
		pad1000(date.getMilliseconds());
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