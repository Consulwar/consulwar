Meteor.startup(function() {
'use strict';

UI.registerHelper('isNewLayout', function() {
	var newLayoutGroups = {
		planet: {
			residential: true,
			military: true
		},
		research: {
			evolution: true
		},
		cosmos: true,
		army: {
			fleet: true,
			ground: true,
			defense: true
		},
		artefacts: true,
		house: true
	};

	return (
		   newLayoutGroups[Router.current().group] === true
		|| (   newLayoutGroups[Router.current().group] 
			&& newLayoutGroups[Router.current().group][Router.current().params.group] === true
			)
	);
});

UI.registerHelper('user', function() {
	return Meteor.user();
});

UI.registerHelper('options', function() {
	var user = Meteor.user();
	return user && user.settings && user.settings.options;
});

UI.registerHelper('Game', function() {
	return Game;
});

UI.registerHelper('serverTime', function() {
	return Session.get('serverTime');
});

UI.registerHelper('backToGroupLink', function() {
	return Router.current().route.path({
		group: Router.current().params.group
	});
});

UI.registerHelper('menuGroup', function() {
	return Router.current().group;
});

UI.registerHelper('itemGroup', function() {
	return Router.current().params.group;
});

UI.registerHelper('currentRouteName', function() {
	return Router.current().route.name;
});

UI.registerHelper('premiumTitle', function() {
	return (Game.hasPremium()
		? {title: 'Только для премиум аккаунтов'}
		: ''
	);
});

UI.registerHelper('hasPremium', Game.hasPremium);

UI.registerHelper('notPremiumDisabled', function() {
	return (Game.hasPremium()
		? ''
		: {disabled: true}
	);
});

UI.registerHelper('battleCountNumber', function(name) {
	var count = game.Battle.countNumber[name];

	if (count) {
		return count.min + ' - ' + count.max;
	} else {
		return '';
	}
});

UI.registerHelper('eq', function(a, b) {
	return _.isEqual(a, b);
});

UI.registerHelper('and', function(a, b) {
	return a && b;
});

UI.registerHelper('or', function(a, b) {
	return a || b;
});

UI.registerHelper('eqandtrue', function(a, b) {
	return a && b && a === b;
});

UI.registerHelper('eqor', function(text, a, b) {
	return text == a || text == b;
});

UI.registerHelper('gt', function(a, b) {
	return a > b;
});

UI.registerHelper('gte', function(a, b) {
	return a >= b;
});

UI.registerHelper('lt', function(a, b) {
	return a < b;
});

UI.registerHelper('lte', function(a, b) {
	return a <= b;
});

UI.registerHelper('multiply', function(a, b) {
	return Math.floor(a * b);
});

UI.registerHelper('div', function(a, b) {
	return Math.floor(a / b);
});

UI.registerHelper('sum', function(a, b) {
	return a + b;
});

UI.registerHelper('abs', function(number) {
	return Math.abs(number);
});

UI.registerHelper('substract', function(a, b) {
	return a - b;
});

UI.registerHelper('nl2br', function(text) {
	return text.replace(/\n/g, '<br/>');
});

UI.registerHelper('not', function(value) {
	return !value;
});

UI.registerHelper('toArray', function(obj) {
	return _.toArray(obj);
});

UI.registerHelper('arrayify',function(obj){
	return _.map(obj, function(value, key) {
		return {
			key,
			value
		};
	});
});

UI.registerHelper('makeArray', function() {
	return _.toArray(arguments).slice(0, -1);
});

UI.registerHelper('makeObject', function() {
	return arguments[0].hash;
});

UI.registerHelper('lookup', function(obj) {
	var result = obj;
	for(var i = 1; i < (arguments.length - 1); i++) {
		if (!_.isObject(result)) {
			return undefined;
		}
		result = result[arguments[i]];
	}
	return _.isFunction(result) ? result() : result;
});

UI.registerHelper('declension', function(number, zeroForm, singleForm, twoForm, manyForm) {
	return zeroForm + (
		(/^(.*[0,2-9])?[1]$/.test(number))
		? singleForm
		: (
			(/^(.*[0,2-9])?[2-4]$/.test(number))
			? twoForm
			: manyForm
		)
	);
});

UI.registerHelper('formatYearMonthDay', function(dateString) {
	var date = new Date(dateString);
	var day = date.getDate();
	day = (day < 10) ? '0' + day : day;
	var month = date.getMonth();
	month = (month < 10) ? '0' + month : month;
	return day + "." + month + "." + date.getFullYear();
}); 

UI.registerHelper('isToday', function(timestamp) {
	var inputDate = new Date(timestamp * 1000);
	var todaysDate = new Date(Game.getCurrentServerTime() * 1000);
	return inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0);
});

UI.registerHelper('formatDate', Game.Helpers.formatDate);
UI.registerHelper('formatHours', Game.Helpers.formatHours);
UI.registerHelper('formatSeconds', Game.Helpers.formatSeconds);
UI.registerHelper('formatTime', Game.Helpers.formatTime);
UI.registerHelper('getNumeralEnding', Game.Helpers.getNumeralEnding);

var iso = {
	0: '',
	1: 'K',
	2: 'M',
	3: 'G',
	4: 'T',
	5: 'P',
	6: 'E',
	7: 'Z',
	8: 'Y'
};

UI.registerHelper('formatNumberWithISO', function(price, limit) {
	if (!_.isNumber(price)) {
		return price;
	}

	limit = (_.isNumber(limit) 
		? limit < 3
			? 3
			: limit
		: 5);

	var exponent = 0;
	var rest = 0;
	while (price.toString().length > limit) {
		rest = price % 1000;
		price = Math.floor(price / 1000);
		exponent++;
	}

	rest = ('00' + rest.toString()).substr(-3);
	price = price.toString();

	if (price.length <= limit - 2 && rest.substr(1, 1) !== '0') {
		rest = '.' + rest.substr(0, 2);
	} else if (price.length <= limit - 1 && rest.substr(0, 1) !== '0') {
		rest = '.' + rest.substr(0, 1);
	} else {
		price = Math.round(price + '.' + rest).toString();
		rest = '';
	}

	price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

	if (iso[exponent] === undefined) {
		return 'o_O ??';
	}

	return price + rest + iso[exponent];
});

var formatNumber = function (num, delimeter) {
	delimeter = delimeter || '';

	num = _.isObject(num) || _.isArray(num) ? num : [num];

	return _.map(num, function(value) {
		if (_.isNumber(value)) {
			value = parseFloat(value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0], 10);
			if (value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0].substr(-1) !== '0') {
				value = value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
			} else if (value.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0].substr(-1) !== '0') {
				value = value.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0];
			}
		}
		value = value.toString();
		return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}).join(delimeter);
};

UI.registerHelper('formatNumber', formatNumber);


var getEffectsTooltip = function(price, effects, target, invert, side, isShowCurrent) {
	if (price.base === undefined) {
		return 'disabled';
	}

	var baseValue = price.base[target];

	var isMultiValue = !!(_.isObject(baseValue) || _.isArray(baseValue));

	var currentValue = baseValue
	  , nextValue = 100; // %

	var effectsValues = [];

	var formatValue = function(value) {
		if (target == 'time') {
			return Game.Helpers.formatSeconds(value);
		} else {
			return formatNumber(value, ' - ');
		}
	};

	if (isMultiValue || currentValue > 0) {
		effectsValues.push({ initial: formatValue(currentValue) });
	}

	var totalValue = _.clone(baseValue);

	var priorities = _.keys(effects);
	var prevPriority = priorities.length > 0 && priorities[0];

	if (prevPriority % 2 !== 0) {
		nextValue = 0;
	} else {
		nextValue = 100;
	}

	for (var priority in effects) {
		if (prevPriority % 2 !== 0 ) {
			currentValue = isMultiValue 
				? _.mapObject(currentValue, function(value) { return value + nextValue; })
				: currentValue + nextValue;
		} else {
			currentValue = isMultiValue 
				? _.mapObject(currentValue, function(value) { 
					return Math.floor(value * (nextValue * 0.01));
				  })
				: Math.floor(currentValue * (nextValue * 0.01));
		}

		if (priority % 2 !== 0) {
			nextValue = 0;
		} else {
			nextValue = 100;
		}
		
		if (effects[priority][target] && effects[priority][target].length > 0) {
			for (var i = 0; i < effects[priority][target].length; i++) {
				var effect = effects[priority][target][i];

				var result = {};

				if ((effect.value > 0 && !invert) || (effect.value < 0 && invert)) {
					result.sign = '+';
					result.negative = invert;
				} else {
					result.sign = '–';
					result.negative = !invert;
				}
				
				if (priority % 2 !== 0 ) {
					if (isMultiValue) {
						totalValue = _.mapObject(totalValue, function(value) {
							return value + effect.value * (invert ? -1 : 1);
						});
					} else {
						totalValue += effect.value * (invert ? -1 : 1);
					}
					
					result.value = formatValue(Math.abs(effect.value));
				} else {
					if (isMultiValue) {
						totalValue = _.mapObject(currentValue, function(value, key) {
							return totalValue[key] + Math.floor(value * (effect.value * 0.01)) * (invert ? -1 : 1);
						});
						result.value = _.toArray(
							_.mapObject(currentValue, function(value) { 
								return Math.abs(Math.floor(value * (effect.value * 0.01)));
							})
						).join(' - ');
					} else {
						totalValue += Math.floor(currentValue * (effect.value * 0.01)) * (invert ? -1 : 1);
						result.value = formatValue( Math.abs(Math.floor(currentValue * (effect.value * 0.01))) );
					}
					result.percent = Math.abs(effect.value);
				}
				nextValue += effect.value;

				result.source = effect.provider.name;

				effectsValues.push(result);
			}

			if (effects[priority][target].length > 0) {
				effectsValues.push({ total: formatValue(totalValue) });
			}
		} else {
			if (priority % 2 !== 0) {
				nextValue = 0;
			} else {
				nextValue = 100;
			}
		}

		prevPriority = priority;
	}

	if (effectsValues.length && effectsValues[effectsValues.length - 1].total) {
		effectsValues[effectsValues.length - 1].final = true;
	}

	return {
		'data-tooltip': Blaze.toHTMLWithData(Template.tooltipTable, {
			isShowCurrent: isShowCurrent,
			target: target,
			price: invert ? price[target] : null,
			values: effectsValues
		}),
		'data-tooltip-direction': side || 's'
	};
};

Tracker.autorun(function() {
	var currentTooltip = Tooltips.get();
	var changed = false;

	var width = $('.tooltip').width();
	if (currentTooltip.css.left < 0) {
		currentTooltip.css.left = 0;
		changed = true;
	} else if (currentTooltip.css.left + width > (document.body.clientWidth - 40)) {
		currentTooltip.css.left = document.body.clientWidth - width - 40;
		changed = true;
	}


	var height = $('.tooltip').height();
	if (currentTooltip.css.top < 0) {
		currentTooltip.css.top = 0;
		changed = true;
	} else if (currentTooltip.css.top + height > (document.body.clientHeight - 40)) {
		currentTooltip.css.top = document.body.clientHeight - height - 40;
		changed = true;
	}

	if (changed) {
		Tooltips.setPosition(currentTooltip.css);
	}
});

UI.registerHelper('priceTooltip', function(price, target) {
	return getEffectsTooltip(price, price.effects, target, true, 'n', true);
});

UI.registerHelper('incomeTooltip', function(effects, target) {
	var income = {base: {}};
	income.base[target] = 0;
	return getEffectsTooltip(income, effects, target, false, 's', true);
});

UI.registerHelper('militaryTooltip', function(characteristics, target) {
	return getEffectsTooltip(characteristics, characteristics.effects, target, false, 'w', false);
});

Template.tooltipTable.helpers({
	current: function() {
		if (this.target == 'time' || !this.isShowCurrent) {
			return null;
		}
		
		var userResources = Game.Resources.currentValue.get();
		var current = userResources[this.target] ? userResources[this.target].amount : 0;

		return (!this.price || current < this.price) ? current : null;
	},

	time: function() {
		if (!this.price || this.target == 'time' || !this.isShowCurrent) {
			return null;
		}

		var income = Game.Resources.getIncome()[this.target];
		if (!income) {
			return null;
		}
		
		var userResources = Game.Resources.currentValue.get();
		var current = userResources[this.target] ? userResources[this.target].amount : 0;

		if (current >= this.price) {
			return null;
		}

		return Math.round((this.price - current) / income * 3600);
	}
});

});