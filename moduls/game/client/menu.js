initMenuClient = function() {

var menu = {
	planet: {
		residential: Game.Building.items.residential, 
		//counsul: game.planet.counsul, 
		military: Game.Building.items.military,
	},
	research: {
		evolution: Game.Research.items.evolution,
		fleetups: Game.Research.items.fleetups,
		//global: game.research.global
	},
	army: {
		fleet: Game.Unit.items.army.fleet,
		//heroes: game.army.heroes,
		ground: Game.Unit.items.army.ground
	},
	/*powerups: {
		avaliable: [],
		activated: [],
		bought: []
	},
	alliance: {
		info: [],
		find: [],
		create: []
	},*/
	/*battle: {
		attack: _.map(Game.Battle.items, function(value) {
			return value;
		}),
		reinforcement: [],
		//statistics: [],
		earth: []
	},*/
	/*battle: {
		events: [],
		reinforcement: [],
		history: []
	},*/
	/*communication: {
		mail: {},
		chat: {}
	},*/
	reptiles: {
		fleet: Game.Unit.items.reptiles.fleet,
		heroes: Game.Unit.items.reptiles.heroes,
		ground: Game.Unit.items.reptiles.ground
	}
}


Template.game_menu.helpers({
	menu: function() {
		var currentRouteName = Router.current().route.getName();

		return _.map(menu, function(menu, key) {
			var groups = _.keys(menu);

			if (groups.length) {
				var firstGroupKeys = _.keys(menu[groups[0]]);
				if (firstGroupKeys.length) {
					var firstItem = menu[groups[0]][firstGroupKeys[0]];

					return {
						engName: key,
						url: firstItem.url({group: firstItem.group}),
						isActive: _.find(menu, function(group) {
							return group[_.keys(group)[0]].type == currentRouteName
						}),
						
					};
				} else {
					return {
						engName: key,
						url: Router.routes[groups[0]].path(),
						isActive: groups[0] == currentRouteName,
						additionalClass: 
							(key == 'communication' && (
								Meteor.user().game.quests.daily.status != game.Quest.status.finished
								|| Game.Mail.Collection.findOne({status: game.Mail.status.unread, to: Meteor.userId()})
							)) 
							? 'has_new_mail' 
							: ''
					}
				}
			} else {
				return {
					engName: key,
					url: Router.routes[key].path(),
					isActive: key == currentRouteName
				}
			}
		});
	}
});
Template.side_menu.helpers({
	sides: function() {
		var currentRouteName = Router.current().route.getName();

		return _.map(menu[Router.current().group], function(items, side) {
			var itemsKeys = _.keys(items);

			if (itemsKeys.length) {
				var firstItem = items[itemsKeys[0]];

				return {
					engName: side,
					//currentConstruction: sideConstruction,
					//constructionRemaningTime: sideConstruction ? sideConstruction.finishTime - Session.get('serverTime') : null,
					//progress: sideConstruction ? true : false,
					url: firstItem.url({group: firstItem.group}),
					isActive: firstItem.group == Router.current().params.group
				}
			} else {
				return {
					engName: side,
					//currentConstruction: sideConstruction,
					//constructionRemaningTime: sideConstruction ? sideConstruction.finishTime - Session.get('serverTime') : null,
					//progress: sideConstruction ? true : false,
					url: Router.routes[side].path(),
					isActive: side == currentRouteName
				}
			}
		})
	}
});


var helpers = {
	items: function() {
		if (Router.current().params.group) {
			return _.toArray(menu[Router.current().group][Router.current().params.group]);
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