Meteor.startup(function () {

initPaymentClient();
initRatingClient();
initResourcesClient();
initBuildingClient();
initResearchClient();
initUnitClient();
initCosmosClient();
initEarthClient();
initHouseClient();
initMutualClient();
initMailClient();
initChatClient();
initQuestClient();
initRouterClient();
initMenuClient();
initStatisticClient();
initCheatsClient();
initMarketClient();

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
});

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
Meteor.subscribe('queue');


test = Router.route('/test', function() {
	console.log('yes');
})


var isActualizeInprogress = false;

Game.actualizeGameInfo = function() {
	console.log('actualize...');
	if (!isActualizeInprogress) {
		isActualizeInprogress = true;
		Meteor.call('actualizeGameInfo', function() {
			isActualizeInprogress = false;
		});
	}
}


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
				Game.actualizeGameInfo();
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


Meteor.setInterval(Game.actualizeGameInfo, 60000);

var hasNewMailStatus = false;
Tracker.autorun(function() {
	var user = Meteor.user();
	if (Game.Quest.hasNewDaily() || Game.Mail.hasUnread() && !hasNewMailStatus) {
		hasNewMailStatus = true;
	} else {
		hasNewMailStatus = false;
	}
});

Accounts.onLogin(Game.actualizeGameInfo);
/*
Deps.autorun(function(){
	var user = Meteor.user();
	if(user && user.game){
		console.log('actualize...', _.clone(Meteor.user()));
		Game.actualizeGameInfo();
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
Template.item.helpers(helpers);
Template.battle.helpers(helpers);


Template.game.events({
	'click header .username .edit': function() {
		var planetName = prompt('Как назвать планету?', Meteor.user().planetName);

		Meteor.call('user.changePlanetName', planetName, function(err, result) {
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

ShowModalWindow = function(template, data) {
	Blaze.renderWithData(
		template, 
		data, 
		$('.over')[0]
	)
}



});