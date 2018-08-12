import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.public.cosmos
  || !Meteor.settings.public.cosmos.speedConfig
  || !Meteor.settings.public.cosmos.minSpeed
  || !Meteor.settings.public.cosmos.maxSpeed
  || !Meteor.settings.public.cosmos.minAcc
  || !Meteor.settings.public.cosmos.maxAcc
  || !Meteor.settings.public.cosmos.speedFactor
  || !Meteor.settings.public.cosmos.collectArtefactsPeriod
  || !Meteor.settings.public.cosmos.fromSpaceToHangarPeriod
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample public.cosmos)');
}

const { speedFactor } = Meteor.settings.public.cosmos;

export default {
  SPEED_CONFIG: Meteor.settings.public.cosmos.speedConfig,
  MIN_SPEED: Meteor.settings.public.cosmos.minSpeed * speedFactor,
  MAX_SPEED: Meteor.settings.public.cosmos.maxSpeed * speedFactor,
  MIN_ACC: Meteor.settings.public.cosmos.minAcc * (speedFactor ** 2),
  MAX_ACC: Meteor.settings.public.cosmos.maxAcc * (speedFactor ** 2),
  FROM_SPACE_TO_HANGAR_PERIOD: Meteor.settings.public.cosmos.fromSpaceToHangarPeriod,
  WITHDRAW_PRICE: 50,
};
