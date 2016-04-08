initHouseClient = function() {

initHouseLib();

Meteor.subscribe('houseItems');

Game.House.showPage = function() {
	var subgroup = this.params.subgroup;
	var item = this.params.item;

	if (subgroup && !item) {
		item = _.keys(Game.House.items[subgroup])[0];
	}

	if (subgroup && item) {
		// show item menu
		var templateName = 'consulHouseItem';
		if (subgroup == 'artefacts') {
			templateName = 'consulHouseArtefacts';
		} else if (subgroup == 'cards') {
			templateName = 'consulHouseCards';
		}

		this.render(templateName, {
			to: 'content',
			data: {
				subgroup: subgroup,
				item: item
			}
		});
	} else {
		// show consul house
		this.render('consulHouse', {
			to: 'content'
		});
	}
}

// ----------------------------------------------------------------------------
// Consul house overview
// ----------------------------------------------------------------------------

Template.consulHouse.helpers({
	items: function() {
		return Game.House.getPlacedItems();
	}
});

// ----------------------------------------------------------------------------
// Consul house item menu
// ----------------------------------------------------------------------------

Template.consulHouseItem.helpers({
	subgroup: function() {
		return Template.instance().data.subgroup;
	},

	item: function() {
		var group = Template.instance().data.subgroup;
		var id = Template.instance().data.item;
		return Game.House.items[group][id];
	},

	subgroupItems: function() {
		var group = Template.instance().data.subgroup;
		return _.map(Game.House.items[group], function(item) {
			return item;
		});
	}
});

Template.consulHouseItem.events({
	'click .buy': function(e, t) {
		var group = t.data.subgroup;
		var id = t.data.item;

		if (!Game.House.items[group][id].canBuy()) {
			return Notifications.error('Не достаточно денег!');
		}

		Meteor.call('house.buyItem', group, id, function(err) {
			if (err) {
				Notifications.error('Не удалось купить предмет', err.error);
			} else {
				Notifications.success('Предмет куплен');
			}
		});
	},

	'click .place': function(e, t) {
		var group = t.data.subgroup;
		var id = t.data.item;
		Meteor.call('house.placeItem', group, id, function(err) {
			if (err) {
				Notifications.error('Не удалось установить предмет', err.error);
			} else {
				Notifications.success('Предмет установлен в палату');
			}
		});
	}
});

// ----------------------------------------------------------------------------
// Consul house artefacts menu
// ----------------------------------------------------------------------------

Template.consulHouseArtefacts.helpers({
	item: function() {
		var id = Template.instance().data.item;
		return Game.Artefacts.items[id];
	},

	subgroupItems: function() {
		return _.map(Game.Artefacts.items, function(item) {
			return item;
		});
	}
});

// ----------------------------------------------------------------------------
// Consul house cards menu
// ----------------------------------------------------------------------------

Template.consulHouseCards.events({
	'click .buy': function(e, t) {
		var id = t.data.item;

		if (!Game.Cards.items[id].canBuy()) {
			return Notifications.error('Не достаточно денег!');
		}

		Meteor.call('cards.buy', id, function(err) {
			if (err) {
				Notifications.error('Не удалось купить карточку', err.error);
			} else {
				Notifications.success('Карточка куплена');
			}
		});
	},

	'click .activate': function(e, t) {
		var id = t.data.item;
		Meteor.call('cards.activate', id, function(err) {
			if (err) {
				Notifications.error('Не удалось активировать карточку', err.error);
			} else {
				Notifications.success('Карточка активирована');
			}
		});
	}
});

Template.consulHouseCards.helpers({
	getTimeLeft: function(timeEnd) {
		var timeLeft = timeEnd - Session.get('serverTime');
		return (timeLeft > 0) ? timeLeft : 0;
	},

	canActivate: function() {
		var item = Game.Cards.items[this.item];
		if (item.amount() <= 0) {
			return false;
		}

		var currentTime = Session.get('serverTime');
		var task = item.getActive();
		if (task && task.finishTime > currentTime) {
			return false;
		}

		var reloadTime = item.nextReloadTime();
		if (reloadTime && reloadTime > currentTime) {
			return false;
		}

		return true;
	},

	finishTime: function() {
		var task = Game.Cards.items[this.item].getActive();
		return (task) ? task.finishTime : null;
	},

	reloadTime: function() {
		var reloadTime = Game.Cards.items[this.item].nextReloadTime();
		return (reloadTime) ? reloadTime : null;
	},

	item: function() {
		var id = this.item;
		return Game.Cards.items[id];
	},

	subgroupItems: function() {
		return _.map(Game.Cards.items, function(item) {
			return item;
		});
	}
});

}