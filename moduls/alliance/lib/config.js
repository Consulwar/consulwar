initAllianceConfigLib = function() {
	'use strict';

	if (!Meteor.settings.public.alliance
		|| !Meteor.settings.public.alliance.creatorRating
		|| !Meteor.settings.public.alliance.creatorBuildingLevel
		|| !Meteor.settings.public.alliance.priceInGGK
		|| !Meteor.settings.public.alliance.priceInHonor
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры альянса (см. settings.sample public.alliance)');
	}

	Game.Alliance.CREATOR_RATING = Meteor.settings.public.alliance.creatorRating;
	Game.Alliance.CREATOR_BUILDING_LEVEL = Meteor.settings.public.alliance.creatorBuildingLevel;
	Game.Alliance.PRICE_IN_GGK = Meteor.settings.public.alliance.priceInGGK;
	Game.Alliance.PRICE_IN_HONOR = Meteor.settings.public.alliance.priceInHonor;
};