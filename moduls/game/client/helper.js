Meteor.startup(function() {

UI.registerHelper('user', function() {
	return Meteor.user();
});

UI.registerHelper('Game', function() {
	return Game;
});

UI.registerHelper('serverTime', function() {
	return Session.get('serverTime');
});

UI.registerHelper('eq', function(a, b) {
	return a === b;
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

UI.registerHelper('lt', function(a, b) {
	return a < b;
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

UI.registerHelper('substract', function(a, b) {
	return a - b;
});

UI.registerHelper('nl2br', function(text) {
	return text.replace(/\n/g, '<br/>');
});

UI.registerHelper('not', function(value) {
	return !value;
});

UI.registerHelper('declension', function(number, zeroForm, singleForm, twoForm, manyForm) {
	return zeroForm + (
		(/^[0,2-9]?[1]$/.test(number))
		? singleForm
		: (
			(/^[0,2-9]?[2-4]$/.test(number))
			? twoForm
			: manyForm
		)
	);
});

/*
UI.registerHelper('formatTimestamp', function(timestamp) {
	var date = new Date(timestamp);
	return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
});*/

UI.registerHelper('formatDate', Game.Helpers.formatDate);

UI.registerHelper('formatSeconds', Game.Helpers.formatSeconds);

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
	price = price.toString();

	var exponent = 0;
	while (price.length > limit) {
		price = (price / 1000);
		if (price.toFixed(2).substr(-1) !== '0') {
			price = price.toFixed(2);
		} else if (price.toFixed(1).substr(-1) !== '0') {
			price = price.toFixed(1);
		} else {
			price = Math.round(price);
		}
		price = price.toString();
		exponent++;
	}

	price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

	if (iso[exponent] === undefined) {
		return 'o_O ??';
	}

	return price + iso[exponent];
});

var formatNumber = function (num, delimeter) {
	delimeter = delimeter || '';

	num = _.isObject(num) || _.isArray(num) ? num : [num];

	return _.map(num, function(value) {
		if (_.isNumber(value)) {
			if (value.toFixed(2).substr(-1) !== '0') {
				value = value.toFixed(2);
			} else if (value.toFixed(1).substr(-1) !== '0') {
				value = value.toFixed(1);
			}
		}
		value = value.toString();
		return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}).join(delimeter);
};

UI.registerHelper('formatNumber', formatNumber);


var getEffectsTooltip = function(price, effects, target, invert, side) {
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
	}

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

	if (effectsValues.length === 0) {
		return;
	}

	if (effectsValues.length && effectsValues[effectsValues.length - 1].total) {
		effectsValues[effectsValues.length - 1].final = true;
	}

	return {
		'data-tooltip': Blaze.toHTMLWithData(Template.tooltipTable, {
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
	return getEffectsTooltip(price, price.effects, target, true, 'n');
});

UI.registerHelper('incomeTooltip', function(effects, target) {
	var income = {base: {}};
	income.base[target] = 0;
	return getEffectsTooltip(income, effects, target, false, 's');
});

UI.registerHelper('militaryTooltip', function(characteristics, target) {
	return getEffectsTooltip(characteristics, characteristics.effects, target, false, 'w');
});


});