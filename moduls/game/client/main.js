Meteor.startup(function () {

initRatingClient();
initArtefactsClient();
initResourcesClient();
initBuildingClient();
initResearchClient();
initUnitClient();
initCosmosClient();
initEarthClient();
initHouseClient();
initMutualClient();
initMailClient();
initQuestClient();
initRouterClient();
initMenuClient();
initCheatsClient();

ChdFeedbackWidget.init({
	url: "//consulwar.helprace.com/chd-widgets/feedback",
	assetsUrl: "//d1culzimi74ed4.cloudfront.net/",
	feedbackType: "link"
});

Meteor.Spinner.options = {
    color: '#fff'
};

Notifications.defaultOptions.timeout = 5000;

Router.configure({
	loadingTemplate: 'loading'
})
/*
Router.map(function() {
	this.route('index', {path: '/'})

	this.route('register', {
		path: '/register',
		layoutTemplate: 'index',
		yieldTemplates: {
			'register_window': {to: 'modal'}
		}
	});
})*/

Router.route('/', function () {
	Session.set('totalUsersCount', '…');
	Session.set('onlineUsersCount', '…');
	
	this.layout('index');

	var user = Meteor.user();
	if (user) {
		if (user.blocked == true) {
			Meteor.logout();
			this.redirect('index');
			alert('Аккаунт заблокирован');
		} else {
			Router.go('game');
		}
	}

	this.render('empty', {to: 'modal'});

	Meteor.call('totalUsersCount', function(err, result) {
		Session.set('totalUsersCount', result);
	});

	Meteor.call('onlineUsersCount', function(err, result) {
		Session.set('onlineUsersCount', result);
	})

	if (window.Metrica != undefined) {
		Metrica.hit(window.location.href, 'Index', document.referrer);
	}

	$('.fancybox').fancybox();
}, {name: 'index'});

Template.index.helpers({
	totalUsersCount: function() { return Session.get('totalUsersCount'); },
	onlineUsersCount: function() { return Session.get('onlineUsersCount'); }
});

Template.index.events({
	'click .fancybox': function(e, t) {
		e.preventDefault();
	} 
});

Router.route('/logout', function () {
	Meteor.logout();
	this.redirect('index');
});

Router.route('register', {
	path: '/register',
	layoutTemplate: 'index',
	yieldTemplates: {
		'register_window': {to: 'modal'}
	}
});


Meteor.subscribe('game');
Meteor.subscribe('mail');
Meteor.subscribe('queue');
Meteor.subscribe('buildings');
Meteor.subscribe('units');
Meteor.subscribe('researches');
Meteor.subscribe('mutualResearch');


Meteor.subscribe('chat');
Meteor.subscribe('online');

test = Router.route('/test', function() {
	console.log('yes');
})


var menu = {
	planet: {
		residential: game.planet.residential, 
		counsul: game.planet.counsul, 
		military: game.planet.military,
	},
	army: {
		fleet: game.army.fleet,
		heroes: game.army.heroes,
		ground: game.army.ground
	},
	research: {
		evolution: game.research.evolution,
		fleetups: game.research.fleetups,
		mutual: game.research.mutual
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
	battle: {
		attack: _.map(Game.Battle.items, function(value) {
			return value;
		}),
		reinforcement: [],
		//statistics: [],
		earth: []
	},
	/*battle: {
		events: [],
		reinforcement: [],
		history: []
	},*/
	messages: {
		'private': [],
		//alliance: [],
		all: []
	},
	reptiles: {
		rfleet: game.reptiles.rfleet,
		rheroes: game.reptiles.rheroes,
		rground: game.reptiles.rground
	}
}

/*
Router.route('/game/:menu?/:side?/:item?', {
	name: 'game',

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

		if (this.params.menu && (this.params.menu in menu || this.params.menu in game)) {
			if (!(this.params.side && (this.params.side in menu[this.params.menu] || this.params.side in game[this.params.menu]))) {
				return this.redirect('game', {
					menu: this.params.menu,
					side: Object.keys(menu[this.params.menu])[0]
				})
			}
		} else {
			return this.redirect('game', {menu: 'planet'});
		}
			
		this.wait(Meteor.subscribe('game'));
		this.wait(Meteor.subscribe('resources'));
		this.wait(Meteor.subscribe('queue'));
		this.wait(Meteor.subscribe('buildings'));
		this.wait(Meteor.subscribe('units'));
		this.wait(Meteor.subscribe('researches'));

		if (this.ready()) {
			Session.set('active_menu', null);
			Session.set('active_side', null);
			Session.set('active_item', null);
			Session.set('point_info', null);

			Session.set('price', null);
			Session.set('priceEffects', null);
			Session.set('level', null);
			Session.set('investments', null);
			Session.set('effect', null);
			Session.set('requirements', null);

			Session.set('active_menu', this.params.menu);
			Session.set('active_side', this.params.side);
			this.next();
		} else {
			this.render('loading', {layout: 'loading_layout'})
		}
	},

	after: function() {
		if (window.Metrica != undefined) {
			Metrica.hit(window.location.href, 'Game', document.referrer);
		}
	},

	action: function() {
		this.render('game');

		if (this.params.menu == 'messages') {
			if (['all', 'alliance'].indexOf(this.params.side) != -1) {
				this.render('chat', {to: 'content'});
			} else {
				this.render('mail', {to: 'content'});
			}	
		} else if (this.params.menu == 'battle') {
			if (this.params.side == 'statistics') {
				var self = this;
				Meteor.call('getTopUsers', function(err, users) {
					for(var i = 0; i < users.length; i++) {
						users[i].place = i + 1;
					}

					self.render('rating', {to: 'content', data: {users: users}});
				});
			} else if (this.params.side == 'reinforcement') {
				this.render('reserve', {to: 'content'});
			} else if (this.params.side == 'earth') {
				this.render('earth', {to: 'content'});

				if (this.params.item) {
					var item = Game.Point.items[this.params.item];
					Session.set('active_item', item);
					Meteor.call('getPointInfo', this.params.item, function(err, info) {
						Session.set('point_info', info);
					});
						
				}
			} else {
				//this.render('battle', {to: 'content'});
				var item = Game.Battle.items[this.params.item];
				Session.set('active_item', item);
				this.render('battle', {to: 'content'});
				Session.set('currentBattleLevel', 1);
				$('select.battle_level').val(1);
			}	
		} else if (this.params.item && game[this.params.menu][this.params.side][this.params.item]) {
			var item = game[this.params.menu][this.params.side][this.params.item];
			Session.set('active_item', item);
			this.render('build', {to: 'content'});
		} else {
			this.render('empty', {to: 'content'});
		}

		updateItemInformation();
	
	
	}
});
*/

Session.set('serverTimeDelta', null);
Session.setDefault('serverTime', Math.floor(new Date().valueOf() / 1000));

Meteor.call('getCurrentTime', function(error, result) {
	Session.set('serverTimeDelta', new Date().valueOf() - result);
	var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
	Session.set('serverTime', serverTime);

	Meteor.setInterval(function() {
		var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
		Session.set('serverTime', serverTime);

		var queue = Game.Queue.getAll();
		for (var i = 0; i < queue.length; i++) {
			if (queue[i].finishTime <= serverTime) {
				Meteor.call('actualizeGameInfo');
				break;
			}
		}
	}, 1000);
});


Tracker.autorun(function () {
	if (Meteor.user() && Meteor.user().game) {
		var user = Meteor.user();

		if (user && user.blocked == true) {
			Meteor.logout();
			Router.go('index');
			alert('Аккаунт заблокирован');
		}

		Session.set('game', user.game);

		//var resources = Game.Resources.getValue();
		//Session.set('resources', resources);

		Session.set('login', user.login);
		Session.set('planetName', user.planetName);
	}
});

mutual = {
	item: null,
	sub: null
};


Meteor.setInterval(function() {
	console.log('actualize...');
	Meteor.call('actualizeGameInfo');
}, 60000);

var hasNewMailStatus = false;
Tracker.autorun(function() {
	var user = Meteor.user();
	if (Game.Quest.hasNewDaily() || Game.Mail.hasUnread() && !hasNewMailStatus) {
		hasNewMailStatus = true;
	} else {
		hasNewMailStatus = false;
	}
});

Accounts.onLogin(function() {
	Meteor.call('actualizeGameInfo');
});
/*
Deps.autorun(function(){
	var user = Meteor.user();
	if(user && user.game){
		console.log('actualize...', _.clone(Meteor.user()));
		Meteor.call('actualizeGameInfo');
	}
});*/

var helpers = {
	information: function() {
		return Session.get('active_item');
	},
	active_menu: function() { return Session.get('active_menu'); },
	active_side: function() { return Session.get('active_side'); },
	active_item: function() { return Session.get('active_item'); },

	price: function() { return Session.get('price'); },
	priceEffects: function() { return Session.get('priceEffects'); },
	incomeEffects: function() { return Session.get('incomeEffects'); },
	income: function() { return Session.get('income'); },
	bonusStorage: function() { return Game.Resources.bonusStorage; },
	additionalArea: function() { return Session.get('additionalArea'); },
	//buildingTime: function() { return Session.get('buildingTime'); },
	level: function() { return Session.get('level'); },
	investments: function() { return Session.get('investments'); },
	count: function() { return Session.get('count'); },
	disableBuild: function() { return Session.get('disableBuild'); },
	enoughResources: function() { return Session.get('enoughResources'); },
	enoughCredits: function() { return Session.get('enoughCredits'); },
	effect: function() { return Session.get('effect'); },

	currentConstruction: function() { return Session.get('currentConstruction'); },
	constructionRemaningTime: function() {
		var currentConstruction = Session.get('currentConstruction');
		return currentConstruction ? Math.max(currentConstruction.finishTime - Session.get('serverTime'), 0) : 0;
	},
	constructionProgress: function() {
		var currentConstruction = Session.get('currentConstruction');
		return currentConstruction ? Math.floor(
			Session.get('constructionRemaningTime') * 10 / (currentConstruction.finishTime - currentConstruction.startTime)) * 10 
			: 100;
	}, 

	game: function() {
		if (Meteor.user()) {
			return Session.get('game');
		}
	},
	resources: function() { return Session.get('resources'); },
	login: function() { return Session.get('login'); },
	planetName: function() { return Session.get('planetName'); },

	currentBattle: function() { return Session.get('currentBattle'); },

	hasNewMail: function() { 
		return (Game.Quest.hasNewDaily() || Game.Mail.hasUnread());
	},

	connection: function() { return Meteor.status(); },
	reconnectTime: function() { return Session.get('reconnectTime'); }
};


Template.game.helpers(helpers);
//Template.build.helpers(helpers);
Template.item.helpers(helpers);
Template.battle.helpers(helpers);


Template.game.events({
	'click header .username .edit': function() {
		var planetName = prompt('Как назвать планету?', Meteor.user().planetName);

		Meteor.call('changePlanetName', planetName, function(err, result) {
			if (err) {
				Notifications.error('Невозможно сменить название планеты', err.error);
			}
		});
	},


	'click progress.metals': function(e, t) {
		Meteor.call('getBonusResources', 'metals', function(error, result) {
			if (error) {
				Notifications.error('Нельзя получить бонусный металл', error.error);
			} else {
				Notifications.success('Бонусный металл получен', '+' + result);
			}
		})
	},

	'click progress.crystals': function(e, t) {
		Meteor.call('getBonusResources', 'crystals', function(error, result) {
			if (error) {
				Notifications.error('Нельзя получить бонусный кристалл', error.error);
			} else {
				Notifications.success('Бонусный кристалл получен', '+' + result);
			}
		})
	}
});

Template.quest.events({
	'click a': function(e, t) {
		if (t.data.type == 'quest') {
			Meteor.call('quests.sendAction', t.data.engName, e.target.dataset.option);
			Blaze.remove(t.view);
		} else {
			Meteor.call('quests.sendDailyAnswer', e.target.dataset.option, function(err, result) {
				var who = t.data.who;
				var title = t.data.title;

				Blaze.remove(t.view);

				Blaze.renderWithData(
					Template.quest, 
					{
						who: who,
						type: 'daily',
						title: title,
						text: result.text,
						reward: result.reward
					}, 
					$('.over')[0]
				)
			})
		}
	},

	'click .close': function(e, t) {
		Blaze.remove(t.view);
	}
});

Template.reward.events({
	'click .reward': function(e, t) {
		Meteor.call('quests.getReward', t.data.engName);
		Blaze.remove(t.view);
	}
});
/*
Template.build.events({
	'keyup .count, change .count': function(e, t) {
		var value = e.target.value.replace(/\D/g,'');
		value = value > 0 ? value : 1;

		var item = game[Session.get('active_menu')][Session.get('active_side')][Session.get('active_item').engName];

		var price = item.price(value);
		Session.set('price', price);
		Session.set('priceEffects', price.effects);
		Session.set('basePrice', price.base);

		Session.set('disableBuild', item.canBuild(value) ? false : true);
	},

	'click button.build': function(e, t) {
		var active_menu = Session.get('active_menu')
		  , active_side = Session.get('active_side')
		  , active_item = Session.get('active_item').engName;

		var item = game[active_menu][active_side][active_item];

		var build = {
			menu: active_menu, 
			side: active_side, 
			item: active_item, 
		};

		if (item.type == 'unit') {
			var value = parseInt(t.find('.count[type="number"]').value);
			check(value, Number)
			build.count = value;
		}

		if (e.target.dataset.action == 'invest') {
			build.investments = parseInt(t.find('.count[type="number"]').value);
			Meteor.call('invest', build, e.target.dataset.currency,
				function(error, message) {
					if (error) {
						Notifications.error('Невозможно вложиться', error.error);
					}
				}
			);
		} else {
			Meteor.call('build', build,
				function(error, message) {
					if (error) {
						Notifications.error('Невозможно начать строительство', error.error);
					} else {
						Notifications.success('Строительство запущено');
					}
				}
			);

			if (item.type != 'unit' && game[active_menu][active_side][active_item].currentLevel() == 0) {
				Router.go('game', {menu: active_menu, side: active_side});
			}
		}
	}
});*/

ShowModalWindow = function(template, data) {
	Blaze.renderWithData(
		template, 
		data, 
		$('.over')[0]
	)
}



});