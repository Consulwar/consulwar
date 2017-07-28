initDataDog = function() {
'use strict';

if (!Meteor.settings.datadog || !Meteor.settings.datadog.isEnabled) {

  console.log('DataDog выключен!');

  Game.datadog = {
    increment: function() {}
  };

} else {
  if (   !Meteor.settings.datadog.host
    || !Meteor.settings.datadog.port
    || Meteor.settings.datadog.prefix === undefined
  ) {
    throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры модуля DataDog (см. settings.sample datadog)');
  }

  let host = Meteor.settings.datadog.host;
  let port = Meteor.settings.datadog.port;
  let prefix = Meteor.settings.datadog.prefix;

  let StatsD = require('hot-shots');
  Game.datadog = new StatsD({
    host, 
    port, 
    prefix,
    globalTags: [`pmId:${process.env.pm_id}`]
  });

  Game.datadog.event('Process started', `processId: ${Game.processId}, pmId: ${process.env.pm_id}`);

  let sendOnlineData = function() {
    Game.datadog.gauge(
      'user.connectedNotAuthorized', 
      UserStatus.connections.find({userId: {$exists: false}}).count()
    );
    Game.datadog.gauge(
      'user.connectedAuthorized', 
      UserStatus.connections.find({userId: {$exists: true}}).count()
    );

    Game.datadog.gauge('user.total', Meteor.users.find().count());
    Game.datadog.gauge('user.online', Meteor.users.find({'status.online': true}).count());
  };

  UserStatus.events.on('connectionLogin', sendOnlineData);
  UserStatus.events.on('connectionLogout', sendOnlineData);
}

};