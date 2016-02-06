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
				additionalArea: 'portal',
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
					},
					artefacts: {
						name: 'Артефакты',
						engName: 'artefacts',
						meetRequirements: true,
						isEnoughResources: true,
						url: Router.routes.house.path({
							group: 'house',
							subgroup: 'artefacts',
							item: 'weapon_parts'
						}),
						items: Game.Artefacts.items
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
		routeName: ['unit'],
		url: firstItemGroupURL(Game.Unit.items.army.fleet),
		items: {
			fleet: {
				name: 'Комический флот',
				additionalArea: 'vaha',
				url: firstItemGroupURL(Game.Unit.items.army.fleet),
				items: Game.Unit.items.army.fleet
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
		routeName: ['cosmos'],
		url: Router.routes.cosmos.path()
	},
	communication: {
		routeName: ['mail', 'chat'],
		url: Router.routes.mail.path(),
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

Template.additional_area.events({
	'click .quest': function() {
		var who = getSideHeroByRoute( Router.current() );
		if (!who) {
			return;
		}

		if (who == 'portal') {
			return ShowModalWindow( Template.support );
		}

		var currentQuest = Game.Quest.getByHero(who);
		if (!currentQuest) {
			// no quest for selected hero, show greetings dialog
			var text = Game.Persons[who].text;

			if (text && text.length > 0) {
				Blaze.renderWithData(
					Template.quest, 
					{
						who: who,
						type: 'quest',
						text: text
					}, 
					$('.over')[0]
				);
			}

		} else {

			// get actual quest and show
			Meteor.call('quests.getInfo', currentQuest.engName, currentQuest.step, function(err, data) {

				var quest = new game.Quest(data);

				if (currentQuest.status == Game.Quest.status.FINISHED) {
					Blaze.renderWithData(
						Template.reward, 
						{
							type: 'quest',
							engName: currentQuest.engName,
							who: who,
							title: [
								'Замечательно!', 
								'Прекрасно!', 
								'Отличная Работа!', 
								'Супер! Потрясающе!', 
								'Уникальный Талант!', 
								'Слава Консулу! ', 
								'Невероятно!', 
								'Изумительно!'
							][Math.floor(Math.random()*8)],
							reward: quest.reward
						}, 
						$('.over')[0]
					);
				} else {
					Blaze.renderWithData(
						Template.quest, 
						{
							type: 'quest',
							engName: currentQuest.engName,
							who: who,
							title: quest.conditionText, 
							text: quest.text, 
							reward: quest.reward,
							options: $.map(quest.options, function(values, name) {
								values.name = name;
								return values;
							}),
							isPrompt: currentQuest.status == Game.Quest.status.PROMPT
						}, 
						$('.over')[0]
					);
				}
			});

		}
	}
});

Template.additional_area.helpers({
	sideHero: function() {
		return getSideHeroByRoute( Router.current() );	
	},

	currentQuest: function() {
		var who = getSideHeroByRoute( Router.current() );
		return (who) ? Game.Quest.getByHero(who) : null;
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