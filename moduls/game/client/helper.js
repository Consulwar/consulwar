Meteor.startup(function() {

Game.Helpers = {
	formatDate: function(timestamp) {
		var date = new Date(timestamp * 1000);
		return (
			('0' + date.getDate()).slice(-2) + '.'
			+ ('0' + (date.getMonth() + 1)).slice(-2) + '.'
			+ date.getFullYear() + ' '
			+ ('0' + date.getHours()).slice(-2) + ':'
			+ ('0' + date.getMinutes()).slice(-2) + ':'
			+ ('0' + date.getSeconds()).slice(-2)
		);
	},

	formatSeconds: function(seconds) {
		if (seconds < 0) {
			return '…';
		}

		var hours = Math.floor(seconds / 3600);
		seconds -= hours * 3600;
		var minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		return (hours > 99 ? hours : ('0' + hours).slice(-2)) + ':'
			+ ('0' + minutes).slice(-2) + ':'
			+ ('0' + seconds).slice(-2);
	}
}

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
	)
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
}


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
		if (price.toFixed(2).substr(-1) != 0) {
			price = price.toFixed(2);
		} else if (price.toFixed(1).substr(-1) != 0) {
			price = price.toFixed(1);
		}
		price = price.toString()
		exponent++;
	}

	price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

	if (iso[exponent] == undefined) {
		return 'o_O ??';
	}

	return price + iso[exponent];
});

var formatNumber = function (num, delimeter) {
	delimeter = delimeter || '';

	num = _.isObject(num) || _.isArray(num) ? num : [num];

	return _.map(num, function(value) {
		if (_.isNumber(value)) {
			if (value.toFixed(2).substr(-1) != 0) {
				value = value.toFixed(2);
			} else if (value.toFixed(1).substr(-1) != 0) {
				value = value.toFixed(1);
			}
		}
		value = value.toString();
		return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}).join(delimeter);
}

UI.registerHelper('formatNumber', formatNumber);


var getEffectsTooltip = function(item, effects, target, invert) {
	if (item.base == undefined) {
		return 'disabled';
	}

	var baseValue = item.base[target];

	var isMultiValue = !!(_.isObject(baseValue) || _.isArray(baseValue));

	var currentValue = baseValue
	  , nextValue = 100; // %

	var text = isMultiValue || currentValue > 0 ? 'Исходная: ' + formatNumber(currentValue, ' - ') : '';

	var totalValue = _.clone(baseValue);

	var priorities = _.keys(effects);
	var prevPriority = priorities.length > 0 && priorities[0];
	for (var priority in effects) {
		if (effects[priority][target] && effects[priority][target].length > 0) {
			if (prevPriority % 2 != 0 ) {
				currentValue = isMultiValue 
					? _.mapObject(currentValue, function(value) { return value + nextValue })
					: currentValue + nextValue;
			} else {
				currentValue = isMultiValue 
					? _.mapObject(currentValue, function(value) { 
						return Math.floor(value * (nextValue * 0.01)) 
					  })
					: Math.floor(currentValue * (nextValue * 0.01));
			}

			if (priority % 2 != 0) {
				nextValue = 0;
			} else {
				nextValue = 100;
			}

			for (var i = 0; i < effects[priority][target].length; i++) {
				var effect = effects[priority][target][i];

				text += "\n";
				if ((effect.value > 0 && !invert) || (effect.value < 0 && invert)) {
					text += '+';
				} else {
					text += '–';
				}
				
				if (priority % 2 != 0 ) {
					if (isMultiValue) {
						totalValue = _.mapObject(totalValue, function(value) {
							return value + effect.value * (invert ? -1 : 1);
						});
					} else {
						totalValue += effect.value * (invert ? -1 : 1);
					}
					
					text += formatNumber(Math.abs(effect.value));
				} else {
					if (isMultiValue) {
						totalValue = _.mapObject(currentValue, function(value, key) {
							return totalValue[key] + Math.floor(value * (effect.value * 0.01)) * (invert ? -1 : 1);
						});
					} else {
						totalValue += Math.floor(currentValue * (effect.value * 0.01)) * (invert ? -1 : 1);
					}

					text += (isMultiValue
						? _.toArray(
							_.mapObject(currentValue, function(value) { 
								return Math.abs(Math.floor(value * (effect.value * 0.01)))
							})).join(' - ')
						: formatNumber( Math.abs(Math.floor(currentValue * (effect.value * 0.01))) )
						) + ' (' + effect.value + '%)';
				}
				nextValue += effect.value;

				text += ' от ' + effect.provider.name;
			}

			if (effects[priority][target].length > 0) {
				text += "\n";
				text += '====================';
				text += "\n";
				text += 'Итого: ';
				text += formatNumber(totalValue, ' - ');
				text += "\n";
			}
		} else {
			if (priority % 2 != 0) {
				nextValue = 0;
			} else {
				nextValue = 100;
			}
		}

		prevPriority = priority;
	}

	return {title: text};
}

UI.registerHelper('priceTooltip', function(price, target) {
	return getEffectsTooltip(price, price.effects, target, true);
});

UI.registerHelper('incomeTooltip', function(effects, target) {
	var income = {base: {}};
	income.base[target] = 0;
	return getEffectsTooltip(income, effects, target);
});

UI.registerHelper('militaryTooltip', function(characteristics, target) {
	return getEffectsTooltip(characteristics, characteristics.effects, target);
});


});