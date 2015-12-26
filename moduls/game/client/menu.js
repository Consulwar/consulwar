initMenuClient = function() {


var firstItemGroupURL = function(items) {
	var firstItem = items[_.keys(items)[0]];
	return firstItem.url({group: firstItem.group});
}

var menu = {
	planet: {
		routeName: ['building'],
		url: firstItemGroupURL(Game.Building.items.residential),
		items: {
			residential: {
				url: firstItemGroupURL(Game.Building.items.residential),
				items: Game.Building.items.residential
			}, 
			military: {
				url: firstItemGroupURL(Game.Building.items.military),
				items: Game.Building.items.military
			}
		}
	}, 
	research: {
		routeName: ['research'],
		url: firstItemGroupURL(Game.Research.items.evolution),
		items: {
			evolution: {
				url: firstItemGroupURL(Game.Research.items.evolution),
				items: Game.Research.items.evolution
			}, 
			fleetups: {
				url: firstItemGroupURL(Game.Research.items.fleetups),
				items: Game.Research.items.fleetups
			}
		}
	}, 
	army: {
		routeName: ['unit'],
		url: firstItemGroupURL(Game.Unit.items.army.fleet),
		items: {
			fleet: {
				url: firstItemGroupURL(Game.Unit.items.army.fleet),
				items: Game.Unit.items.army.fleet
			}, 
			ground: {
				url: firstItemGroupURL(Game.Unit.items.army.ground),
				items: Game.Unit.items.army.ground
			}
		}
	}, 
	communication: {
		routeName: ['mail', 'chat'],
		url: Router.routes.mail.path(),
		additionalClass: function() {
			if (Meteor.user().game.quests.daily.status != game.Quest.status.finished
				|| Game.Mail.Collection.findOne({status: game.Mail.status.unread, to: Meteor.userId()})) {
				return 'has_new_mail';
			} else {
				return '';
			}
		},
		items: {
			mail: {
				url: Router.routes.mail.path()
			}, 
			chat: {
				url: Router.routes.chat.path()
			}
		}
	}, 
	reptiles: {
		routeName: ['reptileUnit'],
		url: firstItemGroupURL(Game.Unit.items.reptiles.fleet),
		items: {
			fleet: {
				url: firstItemGroupURL(Game.Unit.items.reptiles.fleet),
				items: Game.Unit.items.reptiles.fleet
			}, 
			heroes: {
				url: firstItemGroupURL(Game.Unit.items.reptiles.heroes),
				items: Game.Unit.items.reptiles.heroes
			}, 
			ground: {
				url: firstItemGroupURL(Game.Unit.items.reptiles.ground),
				items: Game.Unit.items.reptiles.ground
			}
		}
	}
};

var getMenu = function(menu, isActive) {
	var currentRouteName = Router.current().route.getName();

	return _.map(menu, function(menu, key) {
		return {
			engName: key,
			url: menu.url,
			isActive: isActive(menu, key),
			additionalClass: menu.additionalClass
		}
	});
}

Template.game_menu.helpers({
	menu: function() {
		return getMenu(menu, function(item) {
			return item.routeName.indexOf(Router.current().route.getName()) != -1
		})
	}
});

Template.side_menu.helpers({
	sides: function() {
		return getMenu(menu[Router.current().group].items, function(item, key) {
			return key == Router.current().params.group;
		})
	}
});


var helpers = {
	items: function() {
		if (Router.current().params.group) {
			return _.toArray(menu[Router.current().group].items[Router.current().params.group].items);
		} else {
			return [];
		}
	},
	currentUrl: function() {
		// Iron router при первом открытии возвращет полный пусть. Обрезаем.
		var currentUrl = Router.current().url;
		return currentUrl.substr(currentUrl.indexOf('/game'));
	},
	percentRound10: function(progress) {
		return Math.floor((progress.finishTime - Session.get('serverTime')) * 10 / (progress.finishTime - progress.startTime)) * 10
	},
	menuGroup: function() {
		return Router.current().group;
	},
	itemGroup: function() {
		return Router.current().params.group;
	},
	resources: function() {
		return Game.Resources.currentValue.get();
	},
	income: function() {
		return Game.Resources.getIncome();
	},
	bonusStorage: function() { return Game.Resources.bonusStorage; },
};

Template.items_menu.helpers(helpers);
Template.overlay_menu.helpers(helpers);

}