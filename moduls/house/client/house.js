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
		var templateName = '';
		if (subgroup == 'artefacts') {
			templateName = 'consulHouseArtefacts';
			item = Game.Artefacts.items[item];
		} else if (subgroup == 'cards') {
			templateName = 'consulHouseCards';
			item = Game.Cards.items[item];
		} else {
			templateName = 'consulHouseItem';
			item = Game.House.items[subgroup][item];
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
};

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

		if (!t.data.item.canBuy()) {
			return Notifications.error('Не достаточно денег!');
		}

		Meteor.call('house.buyItem', group, t.data.item.engName, function(err) {
			if (err) {
				Notifications.error('Не удалось купить предмет', err.error);
			} else {
				Notifications.success('Предмет куплен');
			}
		});
	},

	'click .place': function(e, t) {
		var group = t.data.subgroup;

		Meteor.call('house.placeItem', group, t.data.item.engName, function(err) {
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
		if (!t.data.item.canBuy()) {
			return Notifications.error('Не достаточно денег!');
		}

		Meteor.call('cards.buy', t.data.item.engName, function(err) {
			if (err) {
				Notifications.error('Не удалось купить карточку', err.error);
			} else {
				Notifications.success('Карточка куплена');
			}
		});
	},

	'click .activate': function(e, t) {
		Meteor.call('cards.activate', t.data.item.engName, function(err) {
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
		if (this.item.amount() <= 0) {
			return false;
		}

		var currentTime = Session.get('serverTime');
		var task = this.item.getActive();
		if (task && task.finishTime > currentTime) {
			return false;
		}

		var reloadTime = this.item.nextReloadTime();
		if (reloadTime && reloadTime > currentTime) {
			return false;
		}

		return true;
	},

	finishTime: function() {
		var task = this.item.getActive();
		return (task) ? task.finishTime : null;
	},

	reloadTime: function() {
		var reloadTime = this.item.nextReloadTime();
		return (reloadTime && reloadTime > Session.get('serverTime')) ? reloadTime : null;
	},

	subgroupItems: function() {
		return _.map(Game.Cards.items, function(item) {
			return item;
		});
	}
});

};