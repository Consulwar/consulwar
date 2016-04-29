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
			item = Game.Cards.items.general[item];
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

var isLoading = new ReactiveVar(false);
var houseItems = new ReactiveVar(null);

Template.consulHouse.onRendered(function() {
	this.autorun(function() {
		var username = Router.current().getParams().hash;
		if (!username || username == Meteor.user().username) {
			houseItems.set( Game.House.getPlacedItems() );
		} else {
			houseItems.set(null);
			isLoading.set(true);
			Meteor.call('house.getPlacedItems', username, function(err, result) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось открыть палату консула', err.error);
				} else {
					houseItems.set(result);
				}
			});
		}
	});
});

Template.consulHouse.helpers({
	isLoading: function() { return isLoading.get(); },
	items: function() { return houseItems.get(); },
	consulName: function() {
		var hash = Router.current().getParams().hash;
		return (hash && hash != Meteor.user().username) ? hash : null;
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
	},

	planets: function() {
		var artefactId = this.item.engName;

		var basePlanet = Game.Planets.getBase();
		var planets = Game.Planets.getByArtefact(artefactId);
		var nearest = [];
		var top = [];

		var i = 0;
		var n = 0;

		for (i = 0; i < planets.length; i++) {
			// insert additional info
			planets[i].chance = planets[i].artefacts[artefactId];

			// insert nearest
			n = nearest.length;
			while (n-- > 0) {
				var toNearest = Game.Planets.calcDistance(nearest[n], basePlanet);
				var toCurrent = Game.Planets.calcDistance(planets[i], basePlanet);
				if (toNearest <= toCurrent) {
					break;
				}
			}
			nearest.splice(n + 1, 0, planets[i]);

			// insert top
			n = top.length;
			while (n-- > 0) {
				var topValue = top[n].artefacts[artefactId];
				var curValue = planets[i].artefacts[artefactId];
				if (curValue <= topValue) {
					break;
				}
			}
			top.splice(n + 1, 0, planets[i]);
		}

		// aggregate results
		var result = nearest.splice(0, 3);
		n = 0;
		while (result.length < 6 && top.length > 0) {
			var planet = top.shift();
			var isDuplicated = false;
			for (i = 0; i < result.length; i++) {
				if (planet._id == result[i]._id) {
					isDuplicated = true;
					break;
				}
			}
			if (!isDuplicated) {
				result.splice(result.length - n, 0, planet);
				n++;
			}
		}

		return result.length > 0 ? result : null;
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
		var task = this.item.getActiveTask();
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
		var task = this.item.getActiveTask();
		return (task) ? task.finishTime : null;
	},

	reloadTime: function() {
		var reloadTime = this.item.nextReloadTime();
		return (reloadTime && reloadTime > Session.get('serverTime')) ? reloadTime : null;
	},

	subgroupItems: function() {
		return _.map(Game.Cards.items.general, function(item) {
			return item;
		});
	}
});

};