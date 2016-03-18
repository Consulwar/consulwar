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
		switch (tabName.get()) {
			case 'income':
				history.set(null);
				Meteor.call('user.getPaymentHistory', true, function(err, data) {
					history.set(data);
				})
				break;
			case 'expense':
				history.set(null);
				Meteor.call('user.getPaymentHistory', false, function(err, data) {
					history.set(data);
				})
				break;
		}
	});
});

Template.payment.helpers({
	tabName: function() { return tabName.get(); },
	history: function() { return history.get(); },

	paymentItems: function() {
		return _.map(Game.Payment.items, function(item) {
			return item;
		});
	}
});

Template.payment.events({
	'click .tabmenu li': function(e, t) {
		tabName.set( $(e.currentTarget).attr('class') );
	},

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

}