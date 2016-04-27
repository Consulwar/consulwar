initPaymentClient = function() {
	
initPaymentLib();

// ----------------------------------------------------------------------------
// Payment modal window
// ----------------------------------------------------------------------------

Game.Payment.showWindow = function() {
	Blaze.render(Template.payment, $('.over')[0]);
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
		Blaze.remove(t.view);
	},

	'click .paymentItems li': function(e, t) {
		Meteor.call('platbox.getPaymentUrl', e.currentTarget.dataset.id, function(err, url) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Blaze.remove(t.view);
				Blaze.renderWithData(Template.paymentPlatbox, {
					url: url
				},
				$('.over')[0]);
			}
		});
	}
});

Template.paymentPlatbox.events({
	'click .close': function(e, t) {
		Blaze.remove(t.view);
		Blaze.render(Template.payment, $('.over')[0]);
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