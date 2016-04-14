initBlackmarketClient = function() {

initBlackmarketLib();

Game.Blackmarket.showItems = function() {
	Router.current().render('blackmarket', { to: 'buildingMenu' });
}

Game.Blackmarket.hideItems = function() {
	Router.current().render(null, { to: 'buildingMenu' });
}

Template.blackmarket.helpers({
	items: function() {
		return _.map(Game.Blackmarket.items, function(item) {
			return item;
		});
	}
});

Template.blackmarket.events({
	'click .btn-close-horizontal': function(e, t) {
		e.preventDefault();
		Game.Blackmarket.hideItems();
	},

	'click .start': function(e, t) {
		var item = Game.Blackmarket.items[ e.currentTarget.dataset.id ];

		if (!item.checkPrice()) {
			Notifications.error('Недостаточно средств');
			return;
		}

		Meteor.call('blackmarket.buyPack', item.engName, function(err, profit) {
			if (err) {
				Notifications.error('Не удалось купить сундук', err.error);
				return;
			}
			// show reward window
			if (profit) {
				Blaze.renderWithData(
					Template.blackmarketReward,
					{
						profit: profit
					}, 
					$('.over')[0]
				);
			}
		});
	}
});

Template.blackmarketReward.helpers({
	resources: function() {
		if (!this.profit.resources) {
			return null;
		}

		return _.map(this.profit.resources, function(val, key) {
			return {
				engName: key,
				amount: val
			};
		});
	},

	units: function() {
		if (!this.profit.units) {
			return null;
		}

		var units = [];
		for (var group in this.profit.units) {
			for (var name in this.profit.units[group]) {
				units.push({
					engName: name,
					amount: this.profit.units[group][name]
				})
			}
		}
		return units;
	}
});

Template.blackmarketReward.events({
	'click .close, click .take': function(e, t) {
		Blaze.remove(t.view);
	}
});

}