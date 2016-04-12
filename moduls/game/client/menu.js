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
		name: 'Планета',
		routeName: ['building', 'house', 'walletHistory'],
		url: firstItemGroupURL(Game.Building.items.residential),
		items: {
			residential: {
				name: 'Жилой район',
				additionalArea: 'tamily',
				url: firstItemGroupURL(Game.Building.items.residential),
				items: Game.Building.items.residential
			}, 
			military: {
				name: 'Военный район',
				additionalArea: 'thirdenginery',
				url: firstItemGroupURL(Game.Building.items.military),
				items: Game.Building.items.military
			},
			house: {
				name: 'Палата консула',
				url: Router.routes.house.path({ group: 'house' }),
				items: {
					room: {
						name: 'Палата',
						engName: 'room',
						meetRequirements: true,
						isEnoughResources: true,
						url: firstItemUrl(Game.House.items.room),
						items: Game.House.items.room
					},
					tron: {
						name: 'Трон',
						engName: 'tron',
						meetRequirements: true,
						isEnoughResources: true,
						url: firstItemUrl(Game.House.items.tron),
						items: Game.House.items.tron
					},
					avatar: {
						name: 'Аватар',
						engName: 'avatar',
						meetRequirements: true,
						isEnoughResources: true,
						url: firstItemUrl(Game.House.items.avatar),
						items: Game.House.items.avatar
					},
					artefacts: {
						name: 'Артефакты',
						engName: 'artefacts',
						meetRequirements: true,
						isEnoughResources: true,
						url: firstItemUrl(Game.Artefacts.items),
						items: Game.Artefacts.items
					},
					cards: {
						name: 'Карточки',
						engName: 'cards',
						meetRequirements: true,
						isEnoughResources: true,
						url: firstItemUrl(Game.Cards.items),
						items: Game.Cards.items
					}
				}
			}
		}
	}, 
	research: {
		name: 'Исследования',
		routeName: ['research'],
		url: firstItemGroupURL(Game.Research.items.evolution),
		items: {
			evolution: {
				name: 'Эволюционные исследования',
				additionalArea: 'nataly',
				url: firstItemGroupURL(Game.Research.items.evolution),
				items: Game.Research.items.evolution
			}, 
			fleetups: {
				name: 'Улучшения флота',
				additionalArea: 'mechanic',
				url: firstItemGroupURL(Game.Research.items.fleetups),
				items: Game.Research.items.fleetups
			}
		}
	}, 
	army: {
		name: 'Войска',
		routeName: ['unit'],
		url: firstItemGroupURL(Game.Unit.items.army.fleet),
		items: {
			fleet: {
				name: 'Комический флот',
				additionalArea: 'bolz',
				url: firstItemGroupURL(Game.Unit.items.army.fleet),
				items: Game.Unit.items.army.fleet
			}, 
			defense: {
				name: 'Планетарная оборона',
				additionalArea: 'vaha',
				url: firstItemGroupURL(Game.Unit.items.army.defense),
				items: Game.Unit.items.army.defense
			}, 
			ground: {
				name: 'Армия',
				additionalArea: 'tilps',
				url: firstItemGroupURL(Game.Unit.items.army.ground),
				items: Game.Unit.items.army.ground
			}
		}
	}, 
	cosmos: {
		name: 'Космос',
		routeName: ['cosmos', 'cosmosHistory'],
		url: Router.routes.cosmos.path()
	},
	communication: {
		name: 'Связь',
		routeName: ['mail', 'chat'],
		url: Router.routes.mail.path({ page: 1 }),
		additionalClass: function() {
			if (Game.Quest.hasNewDaily() || Game.Mail.hasUnread()) {
				return 'has_new_mail';
			} else {
				return '';
			}
		},
		items: {
			mail: {
				name: 'Почта',
				url: Router.routes.mail.path({ page: 1 })
			}, 
			chat: {
				name: 'Чат',
				url: Router.routes.chat.path({ room: 'general' }),
				getUrl: function() {
					var activeRoom = Session.get('chatRoom');
					return Router.routes.chat.path({
						room: activeRoom ? activeRoom : 'general'
					});
				}
			}
		}
	},
	mutual: {
		name: 'Общее',
		routeName: ['mutual', 'earth', 'earthHistory', 'statistics'],
		url: Router.routes.earth.path({ group: 'earth' }),
		items: {
			earth: {
				name: 'Земля',
				url: Router.routes.earth.path({ group: 'earth' })
			},
			research: {
				name: 'Исследования',
				additionalArea: 'calibrator',
				url: firstItemGroupURL(Game.Mutual.items.research),
				items: Game.Mutual.items.research
			},
			statistics: {
				name: 'Статистика',
				url: Router.routes.statistics.path()
			}
		}
	},
	reptiles: {
		name: 'Рептилии',
		routeName: ['reptileUnit', 'reptileHero'],
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
			getUrl: menu.getUrl,
			tooltip: menu.items,
			isActive: isActive(menu, key),
			additionalClass: menu.additionalClass
		}
	});
}

Template.top_menu.helpers({
	chatRoom: function() {
		var activeRoom = Session.get('chatRoom');
		return activeRoom ? activeRoom : 'general';
	}
})

Template.game_menu.helpers({
	menu: function() {
		return getMenu(menu, function(item) {
			return item.routeName.indexOf(Router.current().route.getName()) != -1
		});
	}
});

Template.side_menu.helpers({
	sides: function() {
		var group = Router.current().group;

		if (!menu[group]) {
			return null;
		}

		return getMenu(menu[group].items, function(item, key) {
			return Router.current().url.indexOf(key) == item.url.indexOf(key);
		});
	},

	getUrl: function(item) {
		return item.getUrl ? item.getUrl() : item.url;
	}
});

var getSideHeroByRoute = function(route) {
	return (
		route &&
		route.group &&
		route.params.group &&
		menu[route.group] &&
		menu[route.group].items &&
		menu[route.group].items[route.params.group] &&
		menu[route.group].items[route.params.group].additionalArea
	);
}

Session.set('sideQuestsOpened', false);

Template.additional_area.events({
	'click .close': function(e, t) {
		e.stopPropagation();
		Session.set('sideQuestsOpened', false);
	},

	'click .open': function(e, t) {
		e.stopPropagation();
		Session.set('sideQuestsOpened', true);
	},

	'click .quest': function(e, t) {
		var who = getSideHeroByRoute( Router.current() );
		if (!who) {
			return;
		}

		if (who == 'portal') {
			return ShowModalWindow( Template.support );
		}

		var currentQuest = Game.Quest.getOneByHero(who);
		if (currentQuest) {
			Game.Quest.showQuest(currentQuest.engName);
		} else {
			Game.Quest.showGreeteing(who);
		}
	},

	'click .quests li': function(e, t) {
		e.stopPropagation();
		var id = $(e.currentTarget).attr('data-id');
		if (id) {
			Game.Quest.showQuest(id);
		}
	}
});

Template.additional_area.helpers({
	sideHero: function() {
		return getSideHeroByRoute( Router.current() );	
	},

	sideHeroName: function() {
		var who = getSideHeroByRoute( Router.current() );
		return who && Game.Persons[who] ? Game.Persons[who].name : null;
	},

	status: function() {
		var who = getSideHeroByRoute( Router.current() );
		var quest = (who) ? Game.Quest.getOneByHero(who) : null;
		return (quest) ? quest.status : null;
	},

	isOpened: function() {
		return Session.get('sideQuestsOpened');
	},

	quests: function() {
		var who = getSideHeroByRoute( Router.current() );
		var quests = (who) ? Game.Quest.getAllByHero(who) : null;
		if (quests) {
			return _.map(quests, function(item) {
				return {
					engName: item.engName,
					name: item.name,
					status: item.status
				}
			});
		}
		return null;
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
		// special check for consul house items
		if (Router.current().params.group == 'house') {
			var item = Router.current().params.item;
			if (item) {
				return part.indexOf(url.substr(0, url.indexOf('/' + item))) != -1;
			}
		}
		// other items
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