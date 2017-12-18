import { Meteor } from 'meteor/meteor';

if (!Meteor.settings.public.mutualSpace
  || !Meteor.settings.public.mutualSpace.galacticRadius
  || !Meteor.settings.public.mutualSpace.accessRating
  || !Meteor.settings.public.mutualSpace.maxFlyTime
) {
  throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры космоса (см. settings.sample mutualSpace)');
}

export default {
  GALACTIC_RADIUS: Meteor.settings.public.mutualSpace.galacticRadius,
  ACCESS_RATING: Meteor.settings.public.mutualSpace.accessRating,
  MAX_FLY_TIME: Meteor.settings.public.mutualSpace.maxFlyTime,
};
