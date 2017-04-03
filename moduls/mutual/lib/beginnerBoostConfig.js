initBeginnerBoostConfigLib = function() {
	'use strict';

	const beginnersBoost = Meteor.settings.public.beginnersBoost;

	if (!beginnersBoost
		|| !beginnersBoost.growth
		|| !beginnersBoost.growth.initial
		|| !beginnersBoost.growth.initial.days
		|| !beginnersBoost.growth.initial.power
		|| !beginnersBoost.growth.initial.interval
		|| !beginnersBoost.growth.continuous
		|| !beginnersBoost.growth.continuous.power
		|| !beginnersBoost.growth.continuous.interval
		|| !beginnersBoost.decrease
		|| !beginnersBoost.decrease.initial
		|| !beginnersBoost.decrease.initial.days
		|| !beginnersBoost.decrease.initial.power
		|| !beginnersBoost.decrease.initial.interval
		|| !beginnersBoost.decrease.continuous
		|| !beginnersBoost.decrease.continuous.power
		|| !beginnersBoost.decrease.continuous.interval
		|| !beginnersBoost.powerUnit
		|| !beginnersBoost.powerUnit.metals
		|| !beginnersBoost.powerUnit.crystals
		|| !beginnersBoost.powerUnit.honor
		|| !beginnersBoost.powerUnit.time

	) {
		throw new Meteor.Error('Ошибка в настройках', 'Заполни параметры буста новичков (см. settings.sample public.beginnersBoost)');
	}

	Game.BeginnerBoost.GROWTH = beginnersBoost.growth;
	Game.BeginnerBoost.DECREASE = beginnersBoost.decrease;
	Game.BeginnerBoost.POWER_UNIT = beginnersBoost.powerUnit;
};