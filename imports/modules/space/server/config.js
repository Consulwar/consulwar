import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.cosmos
  || !Meteor.settings.cosmos.enemyRespawnPeriod
  || !Meteor.settings.cosmos.tradeFleetPeriod
  || !Meteor.settings.cosmos.attackPlayerPeriod
  || !Meteor.settings.cosmos.triggerAttackDelay
  || !Meteor.settings.cosmos.funPeriod
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample cosmos)');
}

export const ENEMY_RESPAWN_PERIOD = Meteor.settings.cosmos.enemyRespawnPeriod;
export const TRADE_FLEET_PERIOD = Meteor.settings.cosmos.tradeFleetPeriod;
export const ATTACK_PLAYER_PERIOD = Meteor.settings.cosmos.attackPlayerPeriod;
export const TRIGGER_ATTACK_DELAY = Meteor.settings.cosmos.triggerAttackDelay;
export const FUN_PERIOD = Meteor.settings.cosmos.funPeriod;
