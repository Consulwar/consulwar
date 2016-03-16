initPaymentClient = function() {
	
initPaymentLib();

var tabName = new ReactiveVar(null);
var history = new ReactiveVar(null);

Game.Payment.showWindow = function() {
	Blaze.render(Template.payment, $('.over')[0]);
}

Template.payment.onRendered(function() {
	var template = this;

	this.autorun(function() {
		template.$('.tabcontent').html('');
		switch (tabName.get()) {
			case 'income':
				Blaze.renderWithData(Template.paymentHistory, { isIncome: true }, template.$('.tabcontent')[0]);
				break;
			case 'expense':
				Blaze.renderWithData(Template.paymentHistory, { isIncome: false }, template.$('.tabcontent')[0]);
				break;
			default:
				Blaze.render(Template.paymentBuy, template.$('.tabcontent')[0]);
				break;
		}
	});
});

Template.payment.events({
	'click .tabmenu li': function(e, t) {
		tabName.set( $(e.currentTarget).attr('class') );
	}
})

Template.paymentBuy.helpers({
	items: function() {
		return _.map(Game.Payment.items, function(item) {
			return item;
		});
	}
});

Template.paymentBuy.events({
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
})

Template.paymentHistory.onRendered(function() {
	history.set(null);
	Meteor.call('user.getPaymentHistory', this.data.isIncome, function(err, data) {
		history.set(data);
	})
});

Template.paymentHistory.helpers({
	history: function() {
		return history.get();
	}
});

}