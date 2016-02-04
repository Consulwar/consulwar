initMenuClient = function() {


var firstItemGroupURL = function(items) {
	var firstItem = items[_.keys(items)[0]];
	return firstItem.url({group: firstItem.group});
}

var firstItemUrl = function(items) {
	var firstItem = items[_.keys(items)[0]];
	return firstItem.url();
}

var menu = {
	planet: {
		routeName: ['building', 'house'],
		url: firstItemGroupURL(Game.Building.items.residential),
		items: {
			residential: {
				name: 'Жилой район',
				url: firstItemGroupURL(Game.Building.items.residential),
				items: Game.Building.items.residential
			}, 
			military: {
				name: 'Военный район',
				url: firstItemGroupURL(Game.Building.items.military),
				items: Game.Building.items.military
			},
			house: {
				name: 'Палата консула',
				url: Router.routes.house.path({ group: 'house' }),
				items: {
					tron: {
						name: 'Трон',
						engName: 'tron',
						meetRequirements: true,
						isEnoughResources: true,
						url: Router.routes.house.path({
							group: 'house',
							subgroup: 'tron',
							item: 'consul'
						}),
						items: Game.House.items.tron
					}
				}
			}
		}
	}, 
	research: {
		routeName: ['research'],
		url: firstItemGroupURL(Game.Research.items.evolution),
		items: {
			evolution: {
				name: 'Эволюционные исследования',
				url: firstItemGroupURL(Game.Research.items.evolution),
				items: Game.Research.items.evolution
			}, 
			fleetups: {
				name: 'Улучшения флота',
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
				name: 'Комический флот',
				url: firstItemGroupURL(Game.Unit.items.army.fleet),
				items: Game.Unit.items.army.fleet
			}, 
			ground: {
				name: 'Армия',
				url: firstItemGroupURL(Game.Unit.items.army.ground),
				items: Game.Unit.items.army.ground
			}
		}
	}, 
	cosmos: {
		routeName: ['cosmos'],
		url: Router.routes.cosmos.path()
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
				name: 'Почта',
				url: Router.routes.mail.path()
			}, 
			chat: {
				name: 'Чат',
				url: Router.routes.chat.path()
			}
		}
	},
	earth: {
		routeName: ['earth'],
		url: Router.routes.earth.path()
	},
	// TODO: Move to research menu!
	/* mutual: {
		routeName: ['mutual'],
		url: firstItemGroupURL(Game.Mutual.items.research),
		items: {
			research: {
				name: 'Исследования',
				url: firstItemGroupURL(Game.Mutual.items.research),
				items: Game.Mutual.items.research
			}
		}
	}, */
	reptiles: {
		routeName: ['reptileUnit'],
		url: firstItemGroupURL(Game.Unit.items.reptiles.fleet),
		items: {
			fleet: {
				name: 'Комический флот',
				url: firstItemGroupURL(Game.Unit.items.reptiles.fleet),
				items: Game.Unit.items.reptiles.fleet
			}, 
			heroes: {
				name: 'Герои',
				url: firstItemGroupURL(Game.Unit.items.reptiles.heroes),
				items: Game.Unit.items.reptiles.heroes
			}, 
			ground: {
				name: 'Армия',
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
			name: menu.name,
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
			return (
				item.items
				? key == Router.current().params.group
				: item.url == Router.current().url
			)
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
	isPartOfUrl: function(url, part) {
		return url.indexOf(part) != -1;
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