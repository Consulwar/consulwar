initPaymentClient = function() {
	
initPaymentLib();

// ----------------------------------------------------------------------------
// Payment modal window
// ----------------------------------------------------------------------------

var canShowReward = false;
var isPaymentSuccess = false;
var paymentView = null;
var platboxView = null;
var rewardView = null;

var showPaymentWindow = function() {
	if (!paymentView) {
		canShowReward = true;
		paymentView = Blaze.render(Template.payment, $('.over')[0]);
	}
};

var hidePaymentWindow = function() {
	if (paymentView) {
		Blaze.remove(paymentView);
		paymentView = null;
	}
};

var showPlatboxWindow = function(url) {
	if (url && !platboxView) {
		isPaymentSuccess = false;
		platboxView = Blaze.renderWithData(Template.paymentPlatbox, { url: url }, $('.over')[0]);
	}
};

var hidePlatboxWindow = function() {
	if (platboxView) {
		Blaze.remove(platboxView);
		platboxView = null;
	}
};

var showRewardWindow = function(itemId) {
	var item = Game.Payment.items[itemId];
	if (item && !rewardView) {
		isPaymentSuccess = true;
		rewardView = Blaze.renderWithData(Template.paymentReward, { item: item }, $('.over')[0]);
	}
};

var hideRewardWindow = function() {
	if (rewardView) {
		Blaze.remove(rewardView);
		rewardView = null;
	}
};

Game.Payment.showWindow = function() {
	showPaymentWindow();
};

Game.Payment.buyItem = function(item) {
	Meteor.call('platbox.getPaymentUrl', item, function(err, url) {
		if (err) {
			Notifications.error(err.error);
		} else {
			hidePaymentWindow();
			showPlatboxWindow(url);
		}
	});
};

Template.payment.onRendered(function() {
	$('.payment.scrollbar-inner').perfectScrollbar();
});

Template.payment.helpers({
	paymentItems: function() {
		return _.filter(_.map(Game.Payment.items, function(item) {
			return item;
		}), function(item) {
			return item.profit.resources !== undefined;
		});
	}
});

Template.payment.events({
	'click .close': function(e, t) {
		hidePaymentWindow();
	},

	'click .paymentItems .greenButton': function(e, t) {
		Game.Payment.buyItem(e.currentTarget.dataset.id);
	}
});

Template.paymentPlatbox.events({
	'click .close': function(e, t) {
		hidePlatboxWindow();
		if (!isPaymentSuccess) {
			showPaymentWindow();
		}
	}
});

Template.paymentReward.events({
	'click .close, click .take': function(e, t) {
		hideRewardWindow();
	}
});

Meteor.subscribe('paymentIncome');

Game.Payment.Income.Collection.find({}).observeChanges({
	added: function(id, fields) {
		if (canShowReward
		 && fields
		 && fields.source
		 && fields.source.type == 'payment'
		) {
			showRewardWindow(fields.source.item);
		}
	}
});

// ----------------------------------------------------------------------------
// Payment side menu
// ----------------------------------------------------------------------------

var isPromoLoading = new ReactiveVar(false);

Template.paymentSide.helpers({
	isAdmin: function() {
		return Meteor.user().role == 'admin';
	}
});

Template.paymentSide.events({
	'click .buy': function(e, t) {
		Game.Payment.showWindow();
	},

	'click .create': function(e, t) {
		Game.Payment.showPromocodeCreate();
	},

	'click .promo .send': function(e, t) {
		if (isPromoLoading.get()) {
			return;
		}

		var code = t.find('.promo .code').value;
		if (!code || code.length === 0) {
			Notifications.error('Нужно ввести промо код');
			return;
		}

		isPromoLoading.set(true);

		Meteor.call('user.activatePromoCode', code, function(err, profit) {
			isPromoLoading.set(false);
			if (err) {
				Notifications.error(err.error);
			} else {
				Game.Payment.showPromocodeReward(profit);
			}
		});
	}
});

// ----------------------------------------------------------------------------
// Payment history
// ----------------------------------------------------------------------------

var isLoading = new ReactiveVar(false);
var history = new ReactiveVar(null);
var historyCurrentPage = null;
var hisotryCurrentType = null;

Game.Payment.showHistory = function() {
	var type = Router.current().getParams().type;
	var page = parseInt( Router.current().getParams().page, 10 );
	var count = 20;
	var isIncome = (type  == 'income') ? true : false;

	if (page == historyCurrentPage && type == hisotryCurrentType) {
		return; // Fucking Iron router! Prevent calling this action two times!
	}

	if (page && page > 0) {
		hisotryCurrentType = type;
		historyCurrentPage = page;

		history.set(null);
		isLoading.set(true);

		var methodName = isIncome ? 'user.getPaymentIncomeHistory' : 'user.getPaymentExpenseHistory';

		Meteor.call(methodName, page, count, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить историю', err.error);
			} else {
				history.set(data);
			}
		});

		this.render('paymentHistory', {
			to: 'content',
			data: {
				count: count,
				isIncome: isIncome
			}
		});
	}
};

Template.paymentHistory.onDestroyed(function() {
	historyCurrentPage = null;
	hisotryCurrentType = null;
});

Template.paymentHistory.helpers({
	isIncome: function() { return this.isIncome; },

	count: function() { return this.count; },
	countTotal: function() {
		return this.isIncome
			? Game.Statistic.getUserValue('payment.income')
			: Game.Statistic.getUserValue('payment.expense');
	},

	isLoading: function() { return isLoading.get(); },
	history: function() { return history.get(); },

	formatProfit: function(profit) { return formatProfit(profit); }
});

// ----------------------------------------------------------------------------
// Reward window
// ----------------------------------------------------------------------------

Game.Payment.showPromocodeReward = function(profit) {
	Blaze.renderWithData(Template.promocodeReward, { profit: profit }, $('.over')[0]);
};

Template.promocodeReward.helpers({
	resources: function() {
		if (!this.profit || !this.profit.resources) {
			return null;
		}

		var result = [];

		for (var key in this.profit.resources) {
			if (!Game.Artefacts.items[key]) {
				result.push({
					engName: key,
					amount: this.profit.resources[key]
				});
			}
		}

		return result.length > 0 ? result : null;
	},

	artefacts: function() {
		if (!this.profit || !this.profit.resources) {
			return null;
		}
		
		var result = [];

		for (var key in this.profit.resources) {
			if (Game.Artefacts.items[key]) {
				result.push({
					engName: key,
					amount: this.profit.resources[key]
				});
			}
		}

		return result.length > 0 ? result : null;
	},

	units: function() {
		if (!this.profit || !this.profit.units) {
			return null;
		}

		var units = this.profit.units;
		var result = [];

		for (var group in units) {
			for (var name in units[group]) {
				result.push({
					engName: name,
					amount: units[group][name]
				});
			}
		}

		return result.length > 0 ? result : null;
	},

	cards: function () {
		if (!this.profit || !this.profit.cards) {
			return null;
		}

		var cards = this.profit.cards;
		var result = [];

		for (var name in cards) {
			var item = Game.Cards.getItem(name);
			if (item) {
				result.push({
					engName: name,
					group: item.cardType,
					amount: cards[name]
				});
			}
		}

		return result.length > 0 ? result : null;
	},

	containers: function () {
		if (!this.profit || !this.profit.containers) {
			return null;
		}

		var containers = this.profit.containers;
		var result = [];

		for (var name in containers) {
			var item = Game.Building.special.Container.items[name];
			if (item) {
				result.push({
					engName: name,
					amount: containers[name]
				});
			}
		}

		return result.length > 0 ? result : null;
	},

	houseItems: function () {
		if (!this.profit || !this.profit.houseItems) {
			return null;
		}

		var items = this.profit.houseItems;
		var result = [];

		for (var group in items) {
			for (var name in items[group]) {
				result.push({
					engName: name,
					group: group
				});
			}
		}

		return result.length > 0 ? result : null;
	}
});

Template.promocodeReward.events({
	'click .take': function(e, t) {
		Blaze.remove(t.view);
	}
});

// ----------------------------------------------------------------------------
// Promo code admin
// ----------------------------------------------------------------------------

Game.Payment.showPromocodeCreate = function() {
	Blaze.render(Template.promocodeCreate, $('.over')[0]);
};

Template.promocodeCreate.helpers({
	loopCount: function(count) {
		var result = [];
		while (count-- > 0) {
			result.push(count);
		}
		return result;
	},

	options: function() {
		var result = [];

		result.push({ name: '----------------------------------------' });

		result.push({ id: 'votePower', name: 'Сила голоса' });

		result.push({ name: '----------------------------------------' });

		result.push({ id: 'containers.defaultContainer', name: 'Бесплатный контейнер' });		

		result.push({ name: '----------------------------------------' });

		result.push({ id: 'resources.humans', name: 'Люди' });
		result.push({ id: 'resources.metals', name: 'Металл' });
		result.push({ id: 'resources.crystals', name: 'Кристалл' });
		result.push({ id: 'resources.honor', name: 'Честь' });
		result.push({ id: 'resources.credits', name: 'ГГК' });

		result.push({ name: '----------------------------------------' });

		for (var cardName in Game.Cards.items.donate) {
			result.push({
				id: 'cards.' + cardName,
				name: Game.Cards.items.donate[cardName].name
			});
		}

		result.push({ name: '----------------------------------------' });

		for (var unitGroup in Game.Unit.items.army) {
			for (var unitName in Game.Unit.items.army[unitGroup]) {
				result.push({
					id: 'units.' + unitGroup + '.' + unitName,
					name: Game.Unit.items.army[unitGroup][unitName].name
				});
			}
		}

		result.push({ name: '----------------------------------------' });

		for (var itemGroup in Game.House.items) {
			for (var itemName in Game.House.items[itemGroup]) {
				result.push({
					id: 'houseItems.' + itemGroup + '.' + itemName,
					name: Game.House.items[itemGroup][itemName].name
				});
			}
		}

		return result;
	}
});

Template.promocodeCreate.events({
	'click .close': function(e, t) {
		Blaze.remove(t.view);
	},

	'click .create': function(e, t) {
		var object = null;
		
		var scriptText = t.find('textarea').value;
		if (scriptText && scriptText.length > 0) {

			// Create by script text
			try {
				object = JSON.parse(scriptText);
			} catch (error) {
				Notifications.error('Ошибка в скрипте', error.message);
				return;
			}

			if (!_.isObject(object)) {
				Notifications.error('Ошибка в скрипте', 'Это не json, а хуй знает что');
				return;
			}

		} else {

			// Create by GUI
			object = {};

			object.code = t.find('input[name="code"]').value;

			var maxActivations = parseInt( t.find('input[name="maxActivations"]').value );
			if (maxActivations > 1) {
				object.maxActivations = maxActivations;
			}

			var minutes = parseInt( t.find('input[name="minutes"]').value );
			if (minutes > 0) {
				object.validPeriod = minutes * 60;
			}

			var type = t.find('input[name="type"]').value;
			if (type && type.length > 0) {
				object.type = type;
			}

			if (t.find('input[name="random"]').checked) {
				object.profit = 'random';
			} else {
				var elements = $('.profit li');
				for (var i = 0; i < elements.length; i++) {
					var id = $(elements[i]).find(':selected').attr('name');
					var count = parseInt( $(elements[i]).find('input').val() );
					if (id && count > 0) {
						if (!object.profit) {
							object.profit = {};
						}

						var keys = id.split('.');
						var curObj = object.profit;

						for (var j = 0; j < keys.length; j++) {
							var key = keys[j];
							if (j == keys.length - 1) {
								if (!curObj[key]) {
									curObj[key] = 0;
								}
								curObj[key] += count;
							} else {
								if (!curObj[key]) {
									curObj[key] = {};
								}
								curObj = curObj[key];
							}
						}
					}
				}
			}

			if (!object.code || object.code.length < 1) {
				Notifications.error('Введите название промо кода');
				return;
			}

			if (!object.profit) {
				Notifications.error('Укажите награду из списка или выберите рандом');
				return;
			}

		}

		if (_.isObject(object)) {
			Game.showAcceptWindow('Создать промо код: \n' + JSON.stringify(object), function() {
				Meteor.call('admin.addPromoCode', object, function(err) {
					if (err) {
						Notifications.error('Не удалось создать промо код', err.error);
					} else {
						Notifications.success('Промо код успешно создан');
					}
				});
			});	
		}
	}
});

var countTotal = new ReactiveVar(null);
var historyCurrentFilterType = null;
var historyCurrentFilterValue = null;

Game.Payment.showPromocodeHistory = function() {
	var options = {};

	options.page = parseInt( Router.current().getParams().page, 10 );
	options.count = 20;

	var filterType = Router.current().getParams().filterType;
	var filterValue = Router.current().getParams().filterValue;
	if (filterType == 'username') {
		options.username = filterValue;
	}
	if (filterType == 'code') {
		options.code = filterValue;
	}

	if (options.page == historyCurrentPage
	 && filterType == historyCurrentFilterType
	 && filterValue == historyCurrentFilterValue
	) {
		return; // Fucking Iron router! Prevent calling this action two times!
	}

	if (options.page && options.page > 0) {
		historyCurrentPage = options.page;
		historyCurrentFilterType = filterType;
		historyCurrentFilterValue = filterValue;

		history.set(null);
		countTotal.set(null);
		isLoading.set(true);

		Meteor.call('admin.getPromocodeHistory', options, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить историю', err.error);
			} else {
				history.set(data.records);
				countTotal.set(data.count);
			}
		});

		this.render('promocodeHistory', {
			to: 'content',
			data: {
				count: options.count,
				username: options.username,
				code: options.code
			}
		});
	}
};

Template.promocodeHistory.onDestroyed(function() {
	historyCurrentPage = null;
	historyCurrentFilterType = null;
	historyCurrentFilterValue = null;
});

Template.promocodeHistory.helpers({
	username: function() { return this.username; },
	code: function() { return this.code; },
	count: function() { return this.count; },
	countTotal: function() { return countTotal.get(); },
	isLoading: function() { return isLoading.get(); },
	history: function() { return history.get(); },
	formatProfit: function(profit) { return formatProfit(profit); }
});

Template.promocodeHistory.events({
	'change input[name="username"]': function(e, t) {
		// reset code filter
		t.find('input[name="code"]').value = '';
		// get username filter
		var username = e.currentTarget.value;
		if (username && username.length > 0) {
			Router.go('promocodeHistory', { page: 1, filterType: 'username', filterValue: username });
		} else {
			Router.go('promocodeHistory', { page: 1 });
		}
	},

	'change input[name="code"]': function(e, t) {
		// reset username filter
		t.find('input[name="username"]').value = '';
		// get code filter
		var code = e.currentTarget.value;
		if (code && code.length > 0) {
			Router.go('promocodeHistory', { page: 1, filterType: 'code', filterValue: code });
		} else {
			Router.go('promocodeHistory', { page: 1 });
		}
	}
});


var formatProfit = function(profit) {
	if (profit == 'random') {
		return 'Случайная награда';
	}

	var result = '';
	for (var type in profit) {
		switch (type) {
			case 'resources':
				for (var resName in profit[type]) {
					result += resName + ': ' + parseInt(profit[type][resName], 10) + ' ';
				}
				break;
			case 'units':
				for (var unitGroup in profit[type]) {
					for (var unitName in profit[type][unitGroup]) {
						result += Game.Unit.items.army[unitGroup][unitName].name + ': ';
						result += parseInt(profit[type][unitGroup][unitName], 10) + ' ';
					}
				}
				break;
			case 'cards':
				for (var cardId in profit[type]) {
					var card = Game.Cards.getItem(cardId);
					if (card) {
						result += card.name + ': ';
						result += parseInt(profit[type][cardId], 10) + ' ';
					}
				}
				break;
			case 'houseItems':
				for (var houseItemGroup in profit[type]) {
					for (var houseItemName in profit[type][houseItemGroup]) {
						result += Game.House.items[houseItemGroup][houseItemName].name + ': ';
						result += parseInt(profit[type][houseItemGroup][houseItemName], 10) + ' ';
					}
				}
				break;
			case 'containers':
				for (var containerId in profit[type]) {
					var container = Game.Building.special.Container.items[containerId];
					if (container) {
						result += 'Бесплатный контейнер: ';
						result += parseInt(profit[type][containerId], 10) + ' ';
					}
				}
				break;
			case 'votePower':
				result += 'Сила голоса: +' + parseInt(profit[type], 10) + ' ';
				break;
		}
	}
	return result;
};

};