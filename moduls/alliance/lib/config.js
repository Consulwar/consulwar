initAllianceConfigLib = function() {
	'use strict';

	if (!Meteor.settings.public.alliance
		|| !Meteor.settings.public.alliance.creatorRating
		|| !Meteor.settings.public.alliance.creatorBuildingLevel
		|| !Meteor.settings.public.alliance.priceInCredits
		|| !Meteor.settings.public.alliance.priceInHonor
		|| !Meteor.settings.public.alliance.invalidateSchedule
		|| !Meteor.settings.public.alliance.updateSchedule
		|| !Meteor.settings.public.alliance.leavingTimeout
		|| !Meteor.settings.public.alliance.participantsPerLevel
		|| !Meteor.settings.public.alliance.countPerPage
	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры альянса (см. settings.sample public.alliance)');
	}

	Game.Alliance.CREATOR_RATING = Meteor.settings.public.alliance.creatorRating;
	Game.Alliance.CREATOR_BUILDING_LEVEL = Meteor.settings.public.alliance.creatorBuildingLevel;
	Game.Alliance.PRICE_IN_CREDITS = Meteor.settings.public.alliance.priceInCredits;
	Game.Alliance.PRICE_IN_HONOR = Meteor.settings.public.alliance.priceInHonor;
	Game.Alliance.INVALIDATE_SCHEDULE = Meteor.settings.public.alliance.invalidateSchedule;
	Game.Alliance.UPDATE_SCHEDULE = Meteor.settings.public.alliance.updateSchedule;
	Game.Alliance.LEAVING_TIMEOUT = Meteor.settings.public.alliance.leavingTimeout;
	Game.Alliance.PARTICIPANTS_PER_LEVEL = Meteor.settings.public.alliance.participantsPerLevel;
	Game.Alliance.COUNT_PER_PAGE = Meteor.settings.public.alliance.countPerPage;
};