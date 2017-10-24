import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.space
  || !Meteor.settings.space.enemyRespawnPeriod
  || !Meteor.settings.space.tradeFleetPeriod
  || !Meteor.settings.space.attackPlayerPeriod
  || !Meteor.settings.space.triggerAttackDelay
  || !Meteor.settings.space.funPeriod
  || !Meteor.settings.space.jobs
  || !Meteor.settings.space.jobs.concurrency
  || !Meteor.settings.space.jobs.payload
  || !Meteor.settings.space.jobs.pollInterval
  || !Meteor.settings.space.jobs.prefetch
  || !Meteor.settings.space.jobs.promote
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample space)');
}

export default {
  ENEMY_RESPAWN_PERIOD: Meteor.settings.space.enemyRespawnPeriod,
  TRADE_FLEET_PERIOD: Meteor.settings.space.tradeFleetPeriod,
  ATTACK_PLAYER_PERIOD: Meteor.settings.space.attackPlayerPeriod,
  TRIGGER_ATTACK_DELAY: Meteor.settings.space.triggerAttackDelay,
  FUN_PERIOD: Meteor.settings.space.funPeriod,
  JOBS: Meteor.settings.space.jobs,
};
