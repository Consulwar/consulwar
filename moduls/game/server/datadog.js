initDataDog = function() {
'use strict';

if (!Meteor.settings.datadog || !Meteor.settings.datadog.host || !Meteor.settings.datadog.port) {
	throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DataDog (см. settings.sample datadog)');
}

let HOST = Meteor.settings.datadog.host;
let PORT = Meteor.settings.datadog.port;

let StatsD = require('node-dogstatsd').StatsD;
Game.datadog = new StatsD(HOST, PORT);


SyncedCron.add({
	name: 'Сохранение в метрики онлайн и всего зарегистрированных',
	schedule: function(parser) {
		return parser.text('every 5 mins');
	},
	job: function() {
		Game.datadog.set('user.totalUsersCount', Meteor.users.find().count());

		Game.datadog.set('user.onlineUsersCount', Meteor.users.find({'status.online': true}).count());
	}
});

};