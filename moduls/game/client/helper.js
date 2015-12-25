Meteor.startup(function () {

UI.registerHelper('user', function () {
	return Meteor.user();
});

UI.registerHelper('Game', function () {
	return Game;
});

UI.registerHelper('serverTime', function () {
	return Session.get('serverTime');
});

UI.registerHelper('eq', function (a, b) {
	return a === b;
});

UI.registerHelper('and', function (a, b) {
	return a && b;
});

UI.registerHelper('or', function (a, b) {
	return a || b;
});

UI.registerHelper('eqandtrue', function (a, b) {
	return a && b && a === b;
});

UI.registerHelper('eqor', function (text, a, b) {
	return text == a || text == b;
});

UI.registerHelper('gt', function (a, b) {
	return a > b;
});

UI.registerHelper('lt', function (a, b) {
	return a < b;
});

UI.registerHelper('multiply', function (a, b) {
	return Math.floor(a * b);
});

UI.registerHelper('div', function (a, b) {
	return Math.floor(a / b);
});

UI.registerHelper('sum', function (a, b) {
	return a + b;
});

UI.registerHelper('substract', function (a, b) {
	return a - b;
});

UI.registerHelper('nl2br', function (text) {
	return text.replace(/\n/g, '<br/>');
});

UI.registerHelper('not', function (value) {
	return !value;
});

/*
UI.registerHelper('formatTimestamp', function (timestamp) {
	var date = new Date(timestamp);
	return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
});*/

UI.registerHelper('formatDate', function (timestamp) {
	var date = new Date(timestamp * 1000);
	return (('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + ' '
		+ ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2));
});

var formatSeconds = function (seconds) {
	if (seconds < 0) {
		return '…';
	}

	var hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	return (hours > 99 ? hours : ('0' + hours).slice(-2)) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
}

UI.registerHelper('formatSeconds', formatSeconds);

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

var formatNumber = function (price) {
	price = price.toString();

	var exponent = 0;
	while(price.length > 5) {
		price = (price / 1000);
		if (price.toFixed(1).substr(-1) != 0) {
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
}

UI.registerHelper('formatNumber', formatNumber);

UI.registerHelper('priceTooltip', function (price, target) {
	var basePrice = price.base[target];
	var effects = price.effects;

	if (basePrice == undefined) {
		return 'disabled';
	}

	if (target == 'time') {
		var textModifier = formatSeconds;
	} else {
		var textModifier = formatNumber;
	}

	var text = '' + textModifier(basePrice);
	for (var priority in effects) {
		if (effects[priority][target]) {
			for (var i = 0; i < effects[priority][target].length; i++) {
				text += ("\n" + (effects[priority][target][i].value > 0 ? '–' : '+')
					+ (priority % 2 == 0 
						? ''
						: textModifier(effects[priority][target][i].value))
					+ (priority % 2 == 0 
						? textModifier(Math.floor(basePrice * (effects[priority][target][i].value * 0.01))) + (' (' + effects[priority][target][i].value + '%)') 
						: '')
					+ ' от ' + effects[priority][target][i].provider.name);
			}
		}
	}

	return {title: text};
});

UI.registerHelper('incomeTooltip', function (effects, target) {
	var basePrice = {};
	basePrice[target] = 0;

	var text = '';
	for (var priority in effects) {
		if (effects[priority][target]) {
			var effect = 0;

			for (var i = 0; i < effects[priority][target].length; i++) {
				text += ("\n" + (effects[priority][target][i].value > 0 ? '+' : '')
					+ (priority % 2 == 0 
						? '' 
						: formatNumber(effects[priority][target][i].value))
					+ (priority % 2 == 0 
						? formatNumber(Math.floor(basePrice[target] * (effects[priority][target][i].value * 0.01))) + (' (' + effects[priority][target][i].value + '%)') 
						: '')
					+ ' от ' + effects[priority][target][i].provider.name);

				effect += effects[priority][target][i].value;
			}

			if (priority % 2 == 0) {
				basePrice[target] = Math.floor(basePrice[target] * (1 + basePrice[target] * 0.01))
			} else {
				basePrice[target] += effect;
			}
		}
	}

	return {title: text};
});

UI.registerHelper('militaryTooltip', function (characteristics, target) {
	var baseCharacteristics = characteristics.base;
	var effects = characteristics.effects;

	if (baseCharacteristics == undefined) {
		return 'disabled';
	}

	var text = '' + formatNumber(baseCharacteristics[target]);
	for (var priority in effects) {
		if (effects[priority][target]) {
			for (var i = 0; i < effects[priority][target].length; i++) {
				text += ("\n" + (effects[priority][target][i].value > 0 ? '+' : '')
					+ (priority % 2 == 0 
						? '' 
						: formatNumber(effects[priority][target][i].value))
					+ (priority % 2 == 0 
						? formatNumber(Math.floor(baseCharacteristics[target] * (effects[priority][target][i].value * 0.01))) + (' (' + effects[priority][target][i].value + '%)') 
						: '')
					+ ' от ' + effects[priority][target][i].provider.name);
			}
		}
	}

	return {title: text};
});

});