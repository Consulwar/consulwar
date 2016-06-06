initBlackmarketClient = function() {

initBlackmarketLib();

Meteor.subscribe('blackmarket');

Game.Blackmarket.showWindow = function() {
	Blaze.render( Template.blackmarket, $('.over')[0] );
};

var isLoading = new ReactiveVar(false);
var rewardUnit = new ReactiveVar(null);

var resetAnimation = function(t) {
	isLoading.set(false);
	rewardUnit.set(null);

	t.$('.take').hide();
	t.$('.title').hide();
	t.$('.close').show();
	t.$('.open').show();
	t.$('.resources').show();
	t.$('.amount').show();

	t.$('.top').css('top', '100px');
	t.$('.bottom').css('top', '180px');
	t.$('.container')
		.css('top', '180px')
		.css('height', '0px');
};

var startAnimation = function(t) {
	t.$('.close').hide();
	t.$('.open').hide();
	t.$('.resources').hide();
	t.$('.amount').hide();

	var duration = 1000;
	t.$('.top').animate({ top: '-114px' }, duration);
	t.$('.bottom').animate({ top: '340px' }, duration);
	t.$('.container').animate({ top: '-40px', height: '428px'}, duration, function() {
		t.$('.take').show();
		t.$('.title').show();
	});
};

Template.blackmarket.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	unit: function() {
		return rewardUnit.get();
	},

	credits: function() {
		return Game.Blackmarket.items.blackmarketPack1.getPrice().credits;
	},

	amount: function() {
		return Game.Blackmarket.items.blackmarketPack1.amount();
	}
});

Template.blackmarket.onRendered(function() {
	resetAnimation(this);
});

Template.blackmarket.events({
	'click .close, click .take': function(e, t) {
		if (isLoading.get()) {
			return;
		}
		resetAnimation(t);
		Blaze.remove(t.view);
	},

	'click .open': function(e, t) {
		if (isLoading.get()) {
			return;
		}

		var item = Game.Blackmarket.items.blackmarketPack1;

		if (!item.checkPrice()) {
			Notifications.error('Недостаточно средств');
			return;
		}

		isLoading.set(true);
		Meteor.call('blackmarket.openPack', item.engName, function(err, profit) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось открыть контайнер', err.error);
				return;
			}
			// show reward
			if (profit && profit.units && profit.units) {
				var group = _.keys(profit.units)[0];
				var engName = _.keys(profit.units[group])[0];
				rewardUnit.set(Game.Unit.items.army[group][engName]);
				startAnimation(t);
			}
		});
	}
});

};