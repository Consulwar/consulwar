initPaymentClient = function() {
	
initPaymentLib();

// ----------------------------------------------------------------------------
// Payment modal window
// ----------------------------------------------------------------------------

Game.Payment.showWindow = function() {
	Blaze.render(Template.payment, $('.over')[0]);
}

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
		Meteor.call('user.buyPaymentItem', e.currentTarget.dataset.id, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Покупка завершена успешно');
			}
		});
	},

	'submit form': function(e, t) {
		e.preventDefault();

		t.$('input[type="submit"]').prop('disabled', true);

		Meteor.call('user.activatePromoCode', t.find('form .code').value, function(err, data) {
			t.$('input[type="submit"]').prop('disabled', false);
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

var history = new ReactiveVar(null);

Game.Payment.showHistory = function() {
	var isIncome = Router.current().getParams().type == 'income';
	var page = parseInt( Router.current().getParams().page, 10 );
	var count = 20;

	if (page && page > 0) {
		history.set(null);
		Meteor.call('user.getPaymentHistory', isIncome, page, count, function(err, data) {
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
}

Template.paymentHistory.helpers({
	count: function() { return this.count; },
	countTotal: function() {
		return this.isIncome
			? Game.Statistic.getUserValue('incomeHistoryCount')
			: Game.Statistic.getUserValue('expenseHistoryCount');
	},

	history: function() { return history.get(); },

	getProfit: function(resources) {
		var result = '';
		for (var name in resources) {
			result += name + ':' + parseInt(resources[name], 10) + ' ';
		}
		return result;
	}
});

}