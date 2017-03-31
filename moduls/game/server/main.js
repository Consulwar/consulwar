//BrowserPolicy.framing.allowAll();

BrowserPolicy.content.allowOriginForAll('*');
BrowserPolicy.content.allowEval('*');
BrowserPolicy.content.allowConnectOrigin("ws:");
BrowserPolicy.content.allowConnectOrigin("wss:");
//heapdump = Meteor.npmRequire('heapdump');

process.env.METEOR_DOWN_KEY = 'Some_great_key_for_testing_84124';

Game.processId = uuid.new();
Game.PROCESS_TIMEOUT = 300;

var ApplicationCollection = new Meteor.Collection('application');

Game.checkIsProcessActive = function(processId) {
	var process = ApplicationCollection.findOne({
		processId: processId
	});
	return process ? true : false;
};

var heartbeat = function() {
	var currentTime = Game.getCurrentTime();
	// update current process
	ApplicationCollection.upsert({
		processId: Game.processId
	}, {
		timestamp: currentTime
	});
	// delete processes older than PROCESS_TIMEOUT
	ApplicationCollection.remove({
		timestamp: { $lt: currentTime - Game.PROCESS_TIMEOUT }
	});
};

heartbeat();
Meteor.setInterval(heartbeat, 5000);


SyncedCron.config({
	log: true,
	collectionName: 'cronHistory',
	utc: true,
	collectionTTL: 604800
});

Meteor.startup(function () {
	initBanHistoryServer();
	initPaymentServer();
	initStatisticServer();
	initResourcesServer();
	initCardsServer();
	initBuildingServer();
	initResearchServer();
	initUnitServer();
	initCosmosServer();
	initEarthServer();
	initHouseServer();
	initMutualServer();
	initMailServer();
	initChatServer();
	initItemsServer();
	initSettingsServer();
	initQuestServer();
	initEntranceRewardServer();
	initBackRewardServer();
	initCheatsServer();
	initDDPLimiter();

	SyncedCron.start();
});

Router.route('/legal/:filename?', function() {
	var filename = 'legal.html';
	switch (this.params.filename) {
		case 'agreement':
			filename = 'agreement.html';
			break;
		case 'rules':
			filename = 'rules.html';
			break;
		case 'price':
			filename = 'price.html';
			break;
	}
	this.response.setHeader('Content-Type', 'text/html');
	this.response.end( Assets.getText(filename) );
}, { where: 'server' });

Router.route('/unsubscribe', function() {
	var mail = this.params.query.mail;
	check(mail, String);
	
	var user = Accounts.findUserByEmail(mail);
	if (!user) {
		this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.response.end('Ошибка');
		return;
	}

	for (var i = 0; i < user.emails.length; i++) {
		if (user.emails[i].address == mail) {
			var set = {};
			set['emails.' + i.toString() + '.unsubscribed'] = true;
			Meteor.users.update({
				_id: user._id
			}, {
				$set: set
			});
			break;
		}
	}

	this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
	this.response.end('Вы отписаны');
}, { where: 'server' });

Meteor.methods({
	actualizeGameInfo: function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		Game.BackReward.getReward();

		console.log('Actualize: ', new Date(), user.username);

		// Update queue tasks and resources
		var needToCheckAgain = Game.Queue.checkAll();
		if (needToCheckAgain)  {
			Game.Queue.checkAll();
		}

		Game.SpaceEvents.actualize();
		Game.Planets.actualize();
		Game.Quest.actualize();

		return true;
	},

	getCurrentTime: function() {
		console.log('getCurrentTime: ', new Date(), this.connection.clientAddress);
		return {
			now: new Date().valueOf(),
			midnight: Game.getMidnightDate()
		};
	}
});

Meteor.publish('game', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {
			fields: {
				createdAt: 1,
				game: 1,
				username: 1,
				planetName: 1,
				role: 1,
				blocked: 1,
				rating: 1,
				votePowerBonus: 1,
				isChatFree: 1,
				timeLastTournament: 1,
				achievements: 1,
				settings: 1,
				music: 1,
				entranceReward: 1
			}
		});
	}
});
