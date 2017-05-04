initRouterClient = function() {
'use strict';

window.GameRouteController = RouteController.extend({
	before: function() {
		if (!Meteor.userId()) {
			this.redirect('index');
			return;
		}

		var user = Meteor.user();
		if (user && user.blocked === true) {
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
			$('body').addClass('game');
			this.render('newgame');
			Tooltips.hide(); // hide all tooltips
			$('.permanent').hide(); // hide cosmos map!
			this.next();
		} else {
			this.render('loading', {layout: 'loading_layout'});
		}
	},

	after: function() {
		Meteor.setTimeout(function() {
			if ($('body').width() > 960) {
				$('.scrollbar-inner').perfectScrollbar();
				$('.scrollbar-inner').perfectScrollbar('update');
			}
		});

		if (window.Metrica !== undefined) {
			Metrica.hit(window.location.href, 'Game', document.referrer);
		}
	}
});



var gameRoutes = {
	planet: {
		building: 'planet/:group(residential|military)/:item?/:menu?'
	},

	house: {
		house: 'house/:subgroup?/:item?'
	},

	artefacts: {
		artefacts: 'resources/artefacts/:item'
	},

	wallet: {
		walletHistory: 'wallet/history/:type(income|expense)/:page'
	},

	admin: {
		promocodeHistory: 'promocode/history/:page/:filterType?/:filterValue?'
	},

	army: {
		unit: 'army/:group(fleet|defense|ground)/:item?',
	},

	info: {
		reptileUnit: 'info/reptiles/:group(fleet|ground)/:item?',
		reptileHero: 'info/reptiles/:group(heroes)/:item?'
	},

	research: {
		research: 'research/:group(evolution|fleetups)/:item?'
	},

	earth: {
		mutual: 'mutual/:group(research)/:item?',
		earth: 'mutual/:group(earth)',
		earthReserve: 'mutual/:group(earth)/reserve',
		earthZone: 'mutual/:group(earth)/zone/:name?',
		earthHistory: 'mutual/:group(earth)/history/:page',
	},


	statistics: {
		statistics: 'statistics/:group(general|science|cosmos|battle|communication)?/:page?'
	},
	
	chat: {
		chat: 'chat/:room',
		mail: 'mail/:page',
		mailAdmin: 'mailadmin/:page'
	},

	cosmos: {
		cosmos: 'cosmos',
		cosmosHistory: 'cosmos/history/:page'
	},

	settings: {
		settings: 'settings'
	}
};

var gameActions = {
	building: Game.Building.showPage,
	research: Game.Research.showPage,
	house: Game.House.showPage,
	artefacts: Game.Resources.showArtefactsPage,
	
	walletHistory: Game.Payment.showHistory,
	promocodeHistory: Game.Payment.showPromocodeHistory,

	chat: Game.Chat.showPage,
	mail: Game.Mail.showPage,
	mailAdmin: Game.Mail.showAdminPage,

	unit: Game.Unit.showPage,
	reptileUnit: Game.Unit.showReptilePage,
	reptileHero: Game.Unit.showReptilePage,

	mutual: Game.Mutual.showPage,
	earth: Game.Earth.showMap,
	earthReserve: Game.Earth.showReserve,
	earthZone: Game.Earth.showZone,
	earthHistory: Game.Earth.showHistory,
	statistics: Game.Rating.showPage,

	cosmos: Game.Cosmos.showPage,
	cosmosHistory: Game.Cosmos.showHistory,

	settings: Game.Settings.showPage
};

var registerRoute = function(group, name, path, action) {
	Router.route('/game/' + path, {
		name: name,
		controller: 'GameRouteController',
		before: function() {
			this.group = group;
			this.next();
		},
		action: action
	});
};

for (var group in gameRoutes) {
	for (var name in gameRoutes[group]) {
		if (gameActions[name] === undefined) {
			throw new Error('Не найдено действие для роута', name, gameRoutes[group][name]);
		}
		registerRoute(group, name, gameRoutes[group][name], gameActions[name]);
	}
}

Router.route('/game/chat/alliance/:room', {
	name: 'chatAlliance',
	controller: 'GameRouteController',
	before: function() {
		this.params.room = 'alliance/' + this.params.room;
		this.group = 'chat';
		this.next();
	},
	action: Game.Chat.showPage
});

Router.route('/game', {
	name: 'game',
	action: function() {
		Router.go('building', {group: 'residential'});
	}
});

Router.route('/logout', function () {
	Meteor.logout();
	this.redirect('index');
});

Router.route('pageNotFound', {
	path: '/(.+)',
	action: function() {
		if(Meteor.user()){
			return this.redirect('game');
		} else {
			return this.redirect('index');
		}
	}
});

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

};