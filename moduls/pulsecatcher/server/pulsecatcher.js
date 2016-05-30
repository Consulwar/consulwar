initPulsecatcherServer = function() {

initPulsecatcherLib();

Game.Pulsecatcher.startNextQuiz = function() {
	// finish active quiz
	var activeQuiz = Game.Pulsecatcher.getActiveQuiz();
	if (activeQuiz) {
		Game.Quiz.Collection.update({
			_id: activeQuiz._id
		}, {
			$set: {
				endDate: Game.getCurrentTime()
			}
		});
	}

	// create next quiz
	var options = {};
	var result = {};

	for (var key in Game.Cards.items.pulsecatcher) {
		options[key] = Game.Cards.items.pulsecatcher[key].name;
		result[key] = 0;
	}

	Game.Quiz.Collection.insert({
		type: 'pulsecatcher',
		startDate: Game.getCurrentTime(),
		endDate: Game.getCurrentTime() + 86400,
		options: options,
		result: result,
		totalVotes: 0
	});
};

SyncedCron.add({
	name: 'Следующее голосование по импульсному уловителю',
	schedule: function(parser) {
		return parser.text(Game.Pulsecatcher.UPDATE_SCHEDULE);
	},
	job: function() {
		Game.Pulsecatcher.startNextQuiz();
	}
});

Meteor.methods({
	'pulsecatcher.voteBonus': function(answer) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}
		
		console.log('pulsecatcher.voteBonus: ', new Date(), user.username);

		if (Game.Building.items.residential.pulsecatcher.currentLevel() < 1) {
			throw new Meteor.Error('Нужно построить Импульсный уловитель');
		}

		var activeQuiz = Game.Pulsecatcher.getActiveQuiz();
		if (!activeQuiz) {
			throw new Meteor.Error('Голосование пока не доступно');
		}

		Meteor.call('quizAnswer', activeQuiz._id, answer);
	},

	'pulsecatcher.activateBonus': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}
		
		console.log('pulsecatcher.activateBonus: ', new Date(), user.username);

		if (Game.Building.items.residential.pulsecatcher.currentLevel() < 1) {
			throw new Meteor.Error('Нужно построить Импульсный уловитель');
		}

		var previousQuiz = Game.Pulsecatcher.getPreviousQuiz();
		var choosen = Game.Pulsecatcher.getChoosenBonus(previousQuiz);

		if (!choosen) {
			throw new Meteor.Error('Нет доступных бонусов');
		}

		var activeList = Game.Pulsecatcher.getActiveBonusList();
		var canActivateChoosen = true;

		for (var key in activeList) {
			// check if choosen already activated
			if (choosen && choosen.engName == key) {
				var task = activeList[key].getActiveTask();
				if (task.startTime >= previousQuiz.endDate) {
					canActivateChoosen = false;
				}
			}
		}

		if (!canActivateChoosen) {
			throw new Meteor.Error('Вы уже активировали бонус');
		}

		var isCardActivated = Game.Cards.activate(choosen, user);
		if (!isCardActivated) {
			throw new Meteor.Error('Не удалось активировать бонус');
		}
	}
});

Meteor.publish('pulsecatcherQuiz', function() {
	if (this.userId) {
		return Game.Quiz.Collection.find({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 },
			limit: 2
		});
	} else {
		this.ready();
	}
});

Meteor.publish('pulsecatcherQuizAnswer', function() {
	if (this.userId) {
		var activeQuiz = Game.Quiz.Collection.findOne({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 }
		});
		if (activeQuiz) {
			return Game.Quiz.Answer.Collection.find({
				user_id: this.userId,
				quiz_id: activeQuiz._id
			});
		}
	} else {
		this.ready();
	}
});

// ----------------------------------------------------------------------------
// Public methods only for development!
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV == 'development') {
	Meteor.methods({
		'pulsecatcher.startNextQuiz': Game.Pulsecatcher.startNextQuiz
	});
}

};