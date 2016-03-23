initMarketClient = function() {

initMarketLib();

var activeFrom = new ReactiveVar(null);
var activeTo = new ReactiveVar(null);

Game.Market.showWindow = function() {
	Blaze.render(Template.market, $('.over')[0]);
}

Template.market.helpers({
	activeFrom: function() { return activeFrom.get(); },
	activeTo: function() { return activeTo.get(); },

	itemsFrom: function() {
		var userResource = Game.Resources.getValue();

		return _.map(Game.Market.exchangeRates, function(item, key) {
			return {
				name: key,
				amount: userResource[key] ? userResource[key].amount : 0
			}
		});
	},

	itemsTo: function() {
		if (!activeFrom.get()) {
			return null;
		}

		return _.map(Game.Market.exchangeRates[ activeFrom.get() ], function(item, key) {
			return {
				name: key,
				rate: Game.Market.getExchangeRate(activeFrom.get(), key)
			}
		});
	},

	formatRate: function(rate) {
		return rate > 0 ? '1 / ' + Math.floor( 1 / rate ) : null;
	}
});

Template.market.events({
	'click .close': function(e, t) {
		e.preventDefault();
		Blaze.remove(t.view);
	},

	'click .from li': function(e, t) {
		activeFrom.set(e.currentTarget.dataset.name);
		activeTo.set(null);
	},

	'click .to li': function(e, t) {
		activeTo.set(e.currentTarget.dataset.name);
		t.$('form .amount').val(0);
		t.$('form .result').html(0);
	},

	'change form .amount': function(e, t) {
		var amount = parseInt( e.currentTarget.value, 10 );

		var from = activeFrom.get();
		var userResource = Game.Resources.getValue();

		var current = userResource[from]
			? parseInt( userResource[from].amount, 10 )
			: 0;

		if (!amount || amount < 0) {
			amount = 0;
		} else if (amount > current) {
			amount = current;
		}

		t.$('form .amount').val(amount);
		t.$('form .result').html(
			Game.Market.getExchangeAmount(activeFrom.get(), activeTo.get(), amount)
		);
	},

	'submit form': function(e, t) {
		e.preventDefault();

		var amount = t.$('form .amount').val();

		Meteor.call('market.exchange', activeFrom.get(), activeTo.get(), amount, function(err, data) {
			if (err) {
				Notifications.error(err.error);
			} else {
				Notifications.success('Обмен успешно завершен');
			}
		});
	}
});

}