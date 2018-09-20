import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.space
  || !Meteor.settings.space.enemyRespawnPeriod
  || !Meteor.settings.space.tradeFleetPeriod
  || !Meteor.settings.space.attackPlayerPeriod
  || !Meteor.settings.space.triggerAttackDelay
  || !Meteor.settings.space.funPeriod
  || !Meteor.settings.space.disableMergebox
  || !Meteor.settings.space.jobs
  || Meteor.settings.space.jobs.enabled === undefined
  || !Meteor.settings.space.jobs.concurrency
  || !Meteor.settings.space.jobs.payload
  || !Meteor.settings.space.jobs.pollInterval
  || !Meteor.settings.space.jobs.prefetch
  || !Meteor.settings.space.jobs.workTimeout
  || !Meteor.settings.space.jobs.promote
  || !Meteor.settings.space.jobs.battleDelay
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample space)');
}

export default {
  ENEMY_RESPAWN_PERIOD: Meteor.settings.space.enemyRespawnPeriod,
  TRADE_FLEET_PERIOD: Meteor.settings.space.tradeFleetPeriod,
  ATTACK_PLAYER_PERIOD: Meteor.settings.space.attackPlayerPeriod,
  TRIGGER_ATTACK_DELAY: Meteor.settings.space.triggerAttackDelay,
  FUN_PERIOD: Meteor.settings.space.funPeriod,
  DISABLE_MERGEBOX: Meteor.settings.space.disableMergebox,
  JOBS: Meteor.settings.space.jobs,
  BATTLE_DELAY: Meteor.settings.space.jobs.battleDelay,
};
