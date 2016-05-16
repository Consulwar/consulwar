//BrowserPolicy.framing.allowAll();

BrowserPolicy.content.allowOriginForAll('*');
BrowserPolicy.content.allowEval('*');
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
	utc: false,
	collectionTTL: 604800
});

Meteor.startup(function () {
	initBanHistoryServer();
	initPaymentServer();
	initRatingServer();
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
	initQuestServer();
	initStatisticServer();
	initAchievementsServer();
	initCheatsServer();
	initMarketServer();
	initColosseumServer();
	initBlackmarketServer();
	initPulsecatcherServer();
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
	}
	this.response.setHeader('Content-Type', 'text/html');
	this.response.end( Assets.getText(filename) );
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

		console.log('Actualize: ', new Date(), user.username);

		// Update queue tasks and resources
		var needToCheckAgain = Game.Queue.checkAll();
		if (needToCheckAgain)  {
			Game.Queue.checkAll();
		}

		Game.SpaceEvents.actualize();
		Game.Planets.actualize();
		Game.Quest.actualize();
		Game.Achievements.actualize();

		return true;
	},

	getCurrentTime: function() {
		return new Date().valueOf();
	}
});

Meteor.publish('game', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {
			fields: {
				game: 1,
				username: 1,
				planetName: 1,
				role: 1,
				blocked: 1,
				rating: 1,
				votePowerBonus: 1,
				isChatFree: 1,
				timeLastTournament: 1,
				achievements: 1
			}
		});
	}
});
