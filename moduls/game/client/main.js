Meteor.startup(function () {
'use strict';

initGameConfigLib();
initUserClient();
initPaymentClient();
initResourcesClient();
initCardsClient();
initStatisticClient();
initBuildingClient();
initResearchClient();
initUnitClient();
initCosmosClient();
initEarthClient();
initHouseClient();
initMutualClient();
initMailClient();
initChatClient();
initSettingsClient();
initQuestClient();
initRouterClient();
initMenuClient();
initItemLib();
initItemClient();
initCheatsClient();
initPopupClient();
initPleerClient();
initEntranceRewardClient();


/*
var preloadImages = function(images) {
	for (var i = 0; i < images.length; i++) {
		var img = new Image();
		img.src = images[i];
	}
};

preloadImages([
	'/img/error.png'
]);
*/

Blaze._allowJavascriptUrls();

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
		if (user.blocked === true) {
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
	});

	if (window.Metrica !== undefined) {
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
	},

	'click .start_registration': function(e, t) {
		e.preventDefault();
		Game.Popup.show('register_window');
	}
});

Meteor.subscribe('game');
Meteor.subscribe('queue');


Game.Queue.Collection.find({}).observe({ 
	removed: function(task) {
		showNotificationFromTask(task);
	}
});


var showNotificationFromTask = function(task) {
	var options = {};
	if (['building', 'research', 'unit'].indexOf(task.type) != -1) {
		options.path = Router.routes[task.type].path({group: task.group, item: task.engName});
	}
	if (task.type == 'building') {
		Game.showDesktopNotification(
			'Здание «' + Game.Building.items[task.group][task.engName].name + '» построено!', 
			options
		);
	} else if (task.type == 'research') {
		Game.showDesktopNotification(
			'Исследование «' + Game.Research.items[task.group][task.engName].name + '» завершено!', 
			options
		);
	} else if (task.type == 'unit') {
		Game.showDesktopNotification(
			'Строительство юнита «' + Game.Unit.items.army[task.group][task.engName].name + '» завершено!', 
			options
		);
	}
};


var isActualizeInprogress = false;

Game.actualizeGameInfo = function() {
	console.log('actualize...');
	if (!isActualizeInprogress && Meteor.user()) {
		isActualizeInprogress = true;
		Meteor.call('actualizeGameInfo', function(err) {
			isActualizeInprogress = false;
			if (err) {
				Game.syncServerTime();
			}
		});
	}
};


Session.set('serverTimeDelta', null);
Session.setDefault('serverTime', Math.floor(new Date().valueOf() / 1000));
let midnight = new Date();
midnight.setUTCHours(-3, 0, 0, 0);
Session.set('serverMidnight', midnight);

var syncTimeFunctionId = null;
var refreshQueueFunctionId = null;

Game.syncServerTime = function() {
	if (refreshQueueFunctionId) {
		Meteor.clearInterval(refreshQueueFunctionId);
		refreshQueueFunctionId = null;
	}

	Meteor.call('getCurrentTime', function(error, result) {
		if (error) {
			// call Game.syncServerTime again after 10 seconds
			if (!syncTimeFunctionId) {
				syncTimeFunctionId = Meteor.setTimeout(Game.syncServerTime, 10000);
			}
			return;
		}

		// clear timeout id
		if (syncTimeFunctionId) {
			Meteor.clearTimeout(syncTimeFunctionId);
			syncTimeFunctionId = null;
		}

		// got server time
		Session.set('serverTimeDelta', new Date().valueOf() - result.now);

		Session.set('serverMidnight', result.midnight);

		var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
		Session.set('serverTime', serverTime);

		var user = Meteor.user();

		// refresh time each second
		refreshQueueFunctionId = Meteor.setInterval(function() {
			var serverTime = Math.floor((new Date().valueOf() - Session.get('serverTimeDelta')) / 1000);
			Session.set('serverTime', serverTime);

			var queue = Game.Queue.getAll();
			for (var i = 0; i < queue.length; i++) {
				if (queue[i].finishTime <= serverTime) {
					Game.actualizeGameInfo();
					break;
				}
			}
		}, (user && user.settings && user.settings.options && user.settings.options.rareScreenUpdates ? 20000 : 1000));
	});
};
Game.syncServerTime();


var retryIntervalId = null;
var retryTime = null;

Tracker.autorun(function() {
	if (Meteor.status().status === "waiting") {
		retryTime = Math.floor( Meteor.status().retryTime / 1000 );
		if (!retryIntervalId) {
			retryIntervalId = Meteor.setInterval(function() {
				var time = retryTime - Math.floor(new Date().valueOf() / 1000);
				Session.set('reconnectTime', (time > 0 ? time : null));
			}, 1000);
		}
	} else {
		if (retryIntervalId) {
			Meteor.clearInterval(retryIntervalId);
			retryIntervalId = null;
		}
		Session.set('reconnectTime', null);
	}
});


Tracker.autorun(function () {
	if (Meteor.user() && Meteor.user().game) {
		var user = Meteor.user();

		if (user.settings && user.settings.options && user.settings.options.mobileVersion && !$('meta[name="viewport"]').length) {
			$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"/>');
		}

		if (user && user.blocked === true) {
			Meteor.logout();
			Router.go('index');
			alert('Аккаунт заблокирован');
		}

		Session.set('game', user.game);

		//var resources = Game.Resources.getValue();
		//Session.set('resources', resources);

		Session.set('username', user.username);
		Session.set('planetName', user.planetName);
	}
});

let mutual = {
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
	currentRouteName: function() { return Router.current().route.getName(); },
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
	username: function() { return Session.get('username'); },
	planetName: function() { return Session.get('planetName'); },

	hasNewMail: function() { 
		return (Game.Quest.hasNewDaily() || Game.Mail.hasUnread());
	},

	fleetInfo: function() {
		var reinforcements = Game.SpaceEvents.getReinforcements().fetch();
		var fleets = Game.SpaceEvents.getFleets().fetch();
		
		if (reinforcements.length === 0 && fleets.length === 0) {
			return null;
		}

		var consul = 0;
		var consulTime = Number.MAX_VALUE;
		var consulId = null;
		var reptile = 0;
		var reptileTime = Number.MAX_VALUE;
		var reptileId = null;
		var isWaitingAttack = false;
		var attackId = null;
		var attackTime = null;

		for (var i = 0; i < fleets.length; i++) {
			if (fleets[i].info.isHumans) {
				consul++;
				if (consulTime > fleets[i].timeEnd) {
					consulTime = fleets[i].timeEnd;
					consulId = fleets[i]._id;
				}
			} else {
				reptile++;
				if (reptileTime > fleets[i].timeEnd) {
					reptileTime = fleets[i].timeEnd;
					reptileId = fleets[i]._id;
				}
				// check attack
				if (!isWaitingAttack) {
					if (fleets[i].info.targetType == Game.SpaceEvents.target.SHIP) {
						// check ship
						var ship = Game.SpaceEvents.getOne(fleets[i].info.targetId);
						if (ship && ship.info.isHumans) {
							isWaitingAttack = true;
						}
					} else if (fleets[i].info.targetType == Game.SpaceEvents.target.PLANET) {
						// check planet
						var planet = Game.Planets.getOne(fleets[i].info.targetId);
						if (planet && (planet.isHome || planet.armyId) && fleets[i].timeEnd > attackTime) {
							isWaitingAttack = true;
							attackId = fleets[i]._id;
							attackTime = fleets[i].timeEnd;
						}
					}
				}
			}
		}

		return {
			reinforcements: reinforcements.length,
			reinforcementsTime: reinforcements.length > 0 ? reinforcements[0].timeEnd : 0,
			reinforcementsId: reinforcements.length > 0 ? reinforcements[0]._id : null,
			consul: consul,
			consulTime: consulTime,
			consulId: consulId,
			reptile: reptile,
			reptileTime: reptileTime,
			reptileId: reptileId,
			isWaitingAttack: isWaitingAttack,
			attackId: attackId,
			attackTime: attackTime
		};
	},

	fleetTime: function(time) {
		var timeLeft = time - Session.get('serverTime');
		return (timeLeft > 0) ? timeLeft : 0;
	},

	userIcon: function() {
		var user = Meteor.user();
		if (user && user.settings && user.settings.chat && user.settings.chat.icon) {
			return user.settings.chat.icon;
		}
		return 'common/1';
	}
};


Template.newgame.helpers(helpers);
Template.item.helpers(helpers);

Template.connection.helpers({
	connection: function() { return Meteor.status(); },
	reconnectTime: function() { return Session.get('reconnectTime'); },
});

Template.newgame.onRendered(function(){
	showTutorialDuringActivation();
	Meteor.setTimeout(function() {
		$('.fleet_info_full .scrollbar-inner').perfectScrollbar('update');
	});
});

var showTutorialDuringActivation = function() {
	var user = Meteor.user();
	if (user
	 && user.settings
	 && user.settings.notifications
	 && user.settings.notifications.notShowQuestsDuringActivation
	) {
		return;
	}

	var currentQuest = Game.Quest.getOneByHero('tamily');
	if (currentQuest
	 && currentQuest.engName == 'tutorial'
	 && currentQuest.status == Game.Quest.status.PROMPT
	) {
		Game.Quest.showQuest('tutorial');
	}
};

Template.newgame.events({
	'click .fleet_info .toggle': function() {
		var options = Meteor.user().settings && Meteor.user().settings.options;
		Meteor.call('settings.setOption', 'hideFleetInfo', !(options && options.hideFleetInfo));
	},
	'click .fleet_info_full .toggle': function() {
		var options = Meteor.user().settings && Meteor.user().settings.options;
		Meteor.call('settings.setOption', 'showFleetInfoFull', !(options && options.showFleetInfoFull));
	}
});

window.ShowModalWindow = function(template, data) {
	Blaze.renderWithData(
		template, 
		data, 
		$('.over')[0]
	);
};

// ----------------------------------------------------------------------------
// Accept window
// ----------------------------------------------------------------------------

var acceptWindowView = null;

Game.showAcceptWindow = function(message, onAccept, onCancel) {
	if (!acceptWindowView) {
		acceptWindowView = Blaze.renderWithData(
			Template.acceptWindow, {
				message: message,
				onAccept: onAccept,
				onCancel: onCancel
			}, $('.over')[0]
		);
	}
};

var closeAcceptWindow = function(callback) {
	if (acceptWindowView) {
		Blaze.remove(acceptWindowView);
		acceptWindowView = null;
	}
	if (_.isFunction(callback)) {
		callback.call();
	}
};

Template.acceptWindow.events({
	'click .close': function(e, t) {
		closeAcceptWindow(t.data.onCancel);
	},

	'click .cancel': function(e, t) {
		closeAcceptWindow(t.data.onCancel);
	},

	'click .accept': function(e, t) {
		closeAcceptWindow(t.data.onAccept);
	}
});

// ----------------------------------------------------------------------------
// Input window
// ----------------------------------------------------------------------------

var inputWindowView = null;

Game.showInputWindow = function(message, value, onAccept, onCancel) {
	if (!inputWindowView) {
		inputWindowView = Blaze.renderWithData(
			Template.inputWindow, {
				message: message,
				value: value,
				onAccept: onAccept,
				onCancel: onCancel
			}, $('.over')[0]
		);
	}
};


Game.showDesktopNotification = function(text, options) {
	if (Meteor.status().status != 'connected') {
		return;
	}
	var user = Meteor.user();

	if (!user || !Notification || Notification.permission != 'granted') {
		return;
	}

	if (!_.isObject(options)) {
		options = {};
	}

	var who = options.who || 'Советник Тамили';
	options.icon = options.icon || '/img/game/tamily-notification.jpg';
	options.body = text;

	if (user.settings
	 && user.settings.notifications
	 && user.settings.notifications.showDesktopNotifications === true
	) {
		var notification = new Notification(who , options);
		notification.onclick = function() {
			window.focus();
			if (options.path) {
				Router.go(options.path);
			}
			this.close();
		};
	
	}
};

var closeInputWindow = function(callback, value) {
	if (inputWindowView) {
		Blaze.remove(inputWindowView);
		inputWindowView = null;
	}
	if (_.isFunction(callback)) {
		callback.call(this, value);
	}
};

Template.inputWindow.events({
	'click .close': function(e, t) {
		closeInputWindow(t.data.onCancel, t.find('input').value);
	},

	'click .cancel': function(e, t) {
		closeInputWindow(t.data.onCancel, t.find('input').value);
	},

	'click .accept': function(e, t) {
		closeInputWindow(t.data.onAccept, t.find('input').value);
	}
});

});