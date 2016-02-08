initRouterClient = function() {

GameRouteController = RouteController.extend({
	before: function() {
		if (!Meteor.userId()) {
			this.redirect('index');
			return;
		}

		var user = Meteor.user();
		if (user && user.blocked == true) {
			Meteor.logout();
			this.redirect('index');
			alert('Аккаунт заблокирован');
		}
			
		this.wait(Meteor.subscribe('game'));
		this.wait(Meteor.subscribe('resources'));
		this.wait(Meteor.subscribe('queue'));
		this.wait(Meteor.subscribe('buildings'));
		this.wait(Meteor.subscribe('units'));
		this.wait(Meteor.subscribe('researches'));

		if (this.ready()) {
			this.render('game');
			this.next();
		} else {
			this.render('loading', {layout: 'loading_layout'})
		}
	},

	after: function() {
		if (window.Metrica != undefined) {
			Metrica.hit(window.location.href, 'Game', document.referrer);
		}
	}
});



var gameRoutes = {
	planet: {
		building: 'planet/:group(residential|military)/:item?',
		house: 'planet/:group(house)/:subgroup?/:item?'
	},

	army: {
		unit: 'army/:group(fleet|defence|ground)/:item?',
	},

	reptiles: {
		reptileUnit: 'reptiles/:group(fleet|ground)/:item?',
		reptileHero: 'reptiles/:group(heroes)/:item?'
	},

	research: {
		research: 'research/:group(evolution|fleetups)/:item?'
	},

	mutual: {
		mutual: 'mutual/:group(research)/:item?'
	},
	
	communication: {
		chat: 'communication/chat/:channel?',
		mail: 'communication/mail/:page?'
	},

	cosmos: {
		cosmos: 'cosmos',
		cosmosHistory: 'cosmos/history',
		cosmosHistoryItem: 'cosmos/history/:id?'
	},

	earth: {
		earth: 'earth',
		earthReserve: 'earth/reserve',
		earthZone: 'earth/zone/:name?'
	}
}

var gameActions = {
	building: Game.Building.showPage,
	research: Game.Research.showPage,
	house: Game.House.showPage,

	chat: Game.Chat.showPage,
	mail: Game.Mail.showPage,

	unit: Game.Unit.showPage,
	reptileUnit: Game.Unit.showPage,
	reptileHero: Game.Unit.showPage,

	mutual: Game.Mutual.showPage,

	cosmos: Game.Cosmos.showPage,
	cosmosHistory: Game.Cosmos.showHistory,
	cosmosHistoryItem: Game.Cosmos.showHistoryItem,

	earth: Game.Earth.showMap,
	earthReserve: Game.Earth.showReserve,
	earthZone: Game.Earth.showZone
}

for (var group in gameRoutes) {
	for (var name in gameRoutes[group]) {
		if (gameActions[name] == undefined) {
			throw new Error('Не найдено действие для роута', name, gameRoutes[group][name]);
		}
		(function(group, name, path, action) {
			Router.route('/game/' + path, {
				name: name,
				controller: 'GameRouteController',
				before: function() {
					this.group = group;
					this.next();
				},
				action: action
			});
		})(group, name, gameRoutes[group][name], gameActions[name]);
	}
}

Router.route('/game', {
	name: 'game',
	action: function() {
		Router.go('building', {group: 'residential'});
	}
})

Router.go(location.href.replace(location.origin, ''));

/*
game/planet/residential
game/planet/military

game/planet/counsul

army/humans/...3
army/reptiles/...3

game/army/fleet
game/army/heroes
game/army/ground

game/research/evolution
game/research/fleetups
game/research/mutual

game/battle/space
game/battle/earth
game/battle/earth/reinforcement

game/messages/mail
game/messages/chat/:channel
*/

/*
Router.route( 'pageNotFound', {
	path: '/game/(.*)',
	action: function() {
		if (this.params.menu && (this.params.menu in menu)) {
			if (!(this.params.side && (this.params.side in menu[this.params.menu]))) {
				return this.redirect('game', {
					menu: this.params.menu,
					side: Object.keys(menu[this.params.menu])[0]
				})
			}
		} else {
			return this.redirect('game', {menu: 'planet'});
		}
	}
});*/

}