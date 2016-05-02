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

Meteor.subscribe('paymentHistory');

Game.Payment.Collection.find({}).observeChanges({
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

		Meteor.call('user.activatePromoCode', code, function(err, data) {
			isPromoLoading.set(false);
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Промо код активирован');
			}
		});
	}
});

// ----------------------------------------------------------------------------
// Payment history
// ----------------------------------------------------------------------------

var isLoading = new ReactiveVar(false);
var history = new ReactiveVar(null);

Game.Payment.showHistory = function() {
	var isIncome = Router.current().getParams().type == 'income';
	var page = parseInt( Router.current().getParams().page, 10 );
	var count = 20;

	if (page && page > 0) {
		history.set(null);
		isLoading.set(true);

		Meteor.call('user.getPaymentHistory', isIncome, page, count, function(err, data) {
			isLoading.set(false);
			if (!err) {
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

Template.paymentHistory.helpers({
	count: function() { return this.count; },
	countTotal: function() {
		return this.isIncome
			? Game.Statistic.getUserValue('incomeHistoryCount')
			: Game.Statistic.getUserValue('expenseHistoryCount');
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
				case 'votePower':
					result += 'Сила голоса: +' + parseInt(profit[type], 10) + ' ';
					break;
			}
		}
		return result;
	}
});

};