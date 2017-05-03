initDataDog = function() {
'use strict';

if (!Meteor.settings.datadog || !Meteor.settings.datadog.isEnabled) {

	console.log('DataDog выключен!');

	Game.datadog = {
		increment: function() {},
		incrementBy: function() {}
	};

} else {
	if (!Meteor.settings.datadog || !Meteor.settings.datadog.host || !Meteor.settings.datadog.port) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DataDog (см. settings.sample datadog)');
	}

	let HOST = Meteor.settings.datadog.host;
	let PORT = Meteor.settings.datadog.port;

	let StatsD = require('node-dogstatsd').StatsD;
	Game.datadog = new StatsD(HOST, PORT);

	//todo remove this when the node-dogstatsd is updated
	if (typeof Game.datadog.incrementBy !== 'function') {
		Game.datadog.incrementBy = function(stats, value) {
			Game.datadog.update_stats(stats, value);
		};
	}

	SyncedCron.add({
		name: 'Сохранение в метрики онлайн и всего зарегистрированных',
		schedule: function(parser) {
			return parser.text('every 5 mins');
		},
		job: function() {
			Game.datadog.gauge('user.totalUsersCount', Meteor.users.find().count());

			Game.datadog.gauge('user.onlineUsersCount', Meteor.users.find({'status.online': true}).count());
		}
	});

}
};