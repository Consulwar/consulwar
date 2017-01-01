initBuildingSpecialContainerClient = function() {

initBuildingSpecialContainerLib();

Meteor.subscribe('containers');

Game.Building.special.Container.showWindow = function() {
	Game.Popup.showPopup('containers');
};

var isLoading = new ReactiveVar(false);
var rewardUnit = new ReactiveVar(null);

var resetAnimation = function(t) {
	isLoading.set(false);
	rewardUnit.set(null);

	t.$('.take').hide();
	t.$('.title').hide();
	t.$('.open').show();
	t.$('.resources').show();
	t.$('.amount').show();

	t.$('.top').css('top', '214px');
	t.$('.bottom').css('top', '294px');
	t.$('.container')
		.css('top', '294px')
		.css('height', '0px');
};

var startAnimation = function(t) {
	t.$('.open').hide();
	t.$('.resources').hide();
	t.$('.amount').hide();

	var duration = 1000;
	t.$('.top').animate({ top: '0px' }, duration);
	t.$('.bottom').animate({ top: '454px' }, duration);
	t.$('.container').animate({ top: '74px', height: '428px'}, duration, function() {
		t.$('.take').show();
		t.$('.title').show();
	});
};

Template.containers.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	unit: function() {
		return rewardUnit.get();
	},

	credits: function() {
		return Game.Building.special.Container.items.defaultContainer.getPrice().credits;
	},

	amount: function() {
		return Game.Building.special.Container.items.defaultContainer.amount();
	}
});

Template.containers.onRendered(function() {
	resetAnimation(this);
});

Template.containers.events({
	'click .take': function(e, t) {
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

		var item = Game.Building.special.Container.items.defaultContainer;

		if (item.amount() <= 0 && !item.checkPrice()) {
			Notifications.error('Недостаточно средств');
			return;
		}

		isLoading.set(true);
		Meteor.call('containers.open', item.engName, function(err, profit) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось открыть контейнер', err.error);
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