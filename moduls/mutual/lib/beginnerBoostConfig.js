initBeginnerBoostConfigLib = function() {
	const beginnersBoost = Meteor.settings.public.beginnersBoost;

	if (!Meteor.settings.public.serverStartDate
		|| !beginnersBoost
		|| !beginnersBoost.growth
		|| !beginnersBoost.growth.days
		|| !beginnersBoost.growth.firstPartValue
		|| !beginnersBoost.growth.firstPartPerDays
		|| !beginnersBoost.growth.secondPartValue
		|| !beginnersBoost.growth.secondPartPerDays
		|| !beginnersBoost.decrease
		|| !beginnersBoost.decrease.days
		|| !beginnersBoost.decrease.firstPartValue
		|| !beginnersBoost.decrease.firstPartPerDays
		|| !beginnersBoost.decrease.secondPartValue
		|| !beginnersBoost.decrease.secondPartPerDays
		|| !beginnersBoost.powerUnit
		|| !beginnersBoost.powerUnit.metals
		|| !beginnersBoost.powerUnit.crystals
		|| !beginnersBoost.powerUnit.honor
		|| !beginnersBoost.powerUnit.time

	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры буста новичков (см. settings.sample public.beginnersBoost)');
	}

	Game.BeginnerBoost.SERVER_START_DATE = new Date(Meteor.settings.public.serverStartDate);
	Game.BeginnerBoost.GROWTH = beginnersBoost.growth;
	Game.BeginnerBoost.DECREASE = beginnersBoost.decrease;
	Game.BeginnerBoost.POWER_UNIT = beginnersBoost.powerUnit;
};