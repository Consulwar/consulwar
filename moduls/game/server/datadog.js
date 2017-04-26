initDataDog = function() {
'use strict';

if (!Meteor.settings.datadog || !Meteor.settings.datadog.host || !Meteor.settings.datadog.port) {
	throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DataDog (см. settings.sample datadog)');
}

let HOST = Meteor.settings.datadog.host;
let PORT = Meteor.settings.datadog.port;

let StatsD = require('node-dogstatsd').StatsD;
Game.datadog = new StatsD(HOST, PORT);

};