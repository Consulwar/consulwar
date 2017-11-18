import { Meteor } from 'meteor/meteor';
import StatsD from 'hot-shots';
import UserStatus from 'meteor/mizzao:user-status';
import Game from '/moduls/game/lib/main.game';
import userCollection from '/imports/modules/User/lib/collection';

// eslint-disable-next-line import/no-mutable-exports
let datadog = { increment: () => true };

if (Meteor.settings.datadog && Meteor.settings.datadog.isEnabled) {
  const { host, port, prefix } = Meteor.settings.datadog;
  if (!host || !port || prefix === undefined) {
    throw new Meteor.Error(
      'Ошибка в настройках',
      'Заполни параметры модуля DataDog (см. settings.sample datadog)',
    );
  }

  datadog = new StatsD({
    host,
    port,
    prefix,
    globalTags: [`pmId:${process.env.pm_id}`],
  });

  datadog.event(
    'Process started',
    `processId: ${Game.processId}, pmId: ${process.env.pm_id}`,
  );

  const sendOnlineData = function() {
    datadog.gauge(
      'user.connectedNotAuthorized',
      UserStatus.connections.find({
        userId: { $exists: false },
      }).count(),
    );
    datadog.gauge(
      'user.connectedAuthorized',
      UserStatus.connections.find({
        userId: { $exists: true },
      }).count(),
    );

    datadog.gauge(
      'user.total',
      userCollection.find().count(),
    );
    datadog.gauge(
      'user.online',
      userCollection.find({ 'status.online': true }).count(),
    );
  };

  UserStatus.events.on('connectionLogin', sendOnlineData);
  UserStatus.events.on('connectionLogout', sendOnlineData);
}

export default datadog;
