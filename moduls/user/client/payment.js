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

Template.payment.helpers({
	paymentItems: function() {
		return _.map(Game.Payment.items, function(item) {
			return item;
		});
	}
});

Template.payment.events({
	'click .close': function(e, t) {
		hidePaymentWindow();
	},

	'click .paymentItems li': function(e, t) {
		Meteor.call('platbox.getPaymentUrl', e.currentTarget.dataset.id, function(err, url) {
			if (err) {
				Notifications.error(err.error);
			} else {
				hidePaymentWindow();
				showPlatboxWindow(url);
			}
		});
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

Template.paymentSide.events({
	'click .buy': function(e, t) {
		Game.Payment.showWindow();
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

	getProfit: function(profit) {
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
				case 'blackmarketPacks':
					for (var packId in profit[type]) {
						var pack = Game.Blackmarket.items[packId];
						if (pack) {
							result += 'Бесплатный контейнер: ';
							result += parseInt(profit[type][packId], 10) + ' ';
						}
					}
					break;
				case 'votePower':
					result += 'Сила голоса: +' + parseInt(profit[type], 10) + ' ';
					break;
			}
		}
		return result;
	}
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

	blackmarketPacks: function () {
		if (!this.profit || !this.profit.blackmarketPacks) {
			return null;
		}

		var packs = this.profit.blackmarketPacks;
		var result = [];

		for (var name in packs) {
			var item = Game.Blackmarket.items[name];
			if (item) {
				result.push({
					engName: name,
					amount: packs[name]
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

};