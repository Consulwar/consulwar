initBuildingsSpecialPulsecatcherClient = function() {

initBuildingsSpecialPulsecatcherLib();

Meteor.subscribe('pulsecatcherQuiz');
var quizAnswerSubscription = Meteor.subscribe('pulsecatcherQuizAnswer');

var isLoading = new ReactiveVar(false);

Template.pulsecatcher.helpers({
	isLoading: function() { return isLoading.get(); },

	quizBonusList: function() {
		var activeQuiz = Game.Building.special.Pulsecatcher.getActiveQuiz();
		if (!activeQuiz) {
			return null;
		}

		var list = [];
		for (var key in Game.Cards.items.pulsecatcher) {
			if (activeQuiz.options[key]) {
				list.push( Game.Cards.items.pulsecatcher[key] );
			}
		}
		return list;
	},

	userVote: function() {
		var activeQuiz = Game.Building.special.Pulsecatcher.getActiveQuiz();
		if (!activeQuiz) {
			return false;
		}

		var userAnswer = Game.Quiz.Answer.Collection.findOne({
			user_id: Meteor.userId(), 
			quiz_id: activeQuiz._id
		});

		return userAnswer;
	},

	calcVoteValue: function(answer) {
		var activeQuiz = Game.Building.special.Pulsecatcher.getActiveQuiz();
		if (!activeQuiz || activeQuiz.totalVotes === 0) {
			return 0;
		}
		return Math.round( activeQuiz.result[answer] / activeQuiz.totalVotes * 100 );
	},

	choosenBonusList: function() {
		var previousQuiz = Game.Building.special.Pulsecatcher.getPreviousQuiz();
		var choosen = Game.Building.special.Pulsecatcher.getChoosenBonus(previousQuiz);
		var activeList = Game.Building.special.Pulsecatcher.getActiveBonusList();

		var result = [];
		var canActivateChoosen = true;

		for (var key in activeList) {
			result.push({
				canActivate: false,
				card: activeList[key]
			});
			// check if choosen already activated
			if (choosen && choosen.engName == key) {
				var task = activeList[key].getActiveTask();
				if (task.startTime >= previousQuiz.endDate) {
					canActivateChoosen = false;
				}
			}
		}

		result.sort(function(a, b) {
			return b.card.getActiveTask().startTime - a.card.getActiveTask().startTime;
		});

		if (choosen && canActivateChoosen && result.length < 2) {
			result.unshift({
				canActivate: true,
				card: choosen
			});
		}

		return result.length > 0 ? result : null;
	},

	getTimeLeft: function(card) {
		var task = card.getActiveTask();
		var finishTime = (task) ? task.finishTime : 0;
		var timeLeft = finishTime - Session.get('serverTime');
		return (timeLeft > 0) ? timeLeft : 0;
	}
});

Template.pulsecatcher.events({
	'click .vote': function(e, t) {
		var answer = e.currentTarget.dataset.id;
		var activeQuiz = Game.Building.special.Pulsecatcher.getActiveQuiz();
		if (answer && activeQuiz && !isLoading.get()) {
			isLoading.set(true);
			Meteor.call('pulsecatcher.voteBonus', answer, function(err, result) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось проголосовать', err.error);
				} else {
					Notifications.success('Вы успешно проголосовали');
					// refresh answer subscription
					if (quizAnswerSubscription) {
						quizAnswerSubscription.stop();
					}
					quizAnswerSubscription = Meteor.subscribe('pulsecatcherQuizAnswer');
				}
			});
		}
	},

	'click .activate': function(e, t) {
		if (!isLoading.get()) {
			isLoading.set(true);
			Meteor.call('pulsecatcher.activateBonus', function(err, result) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось активировать бонус', err.error);
				} else {
					Notifications.success('Бонус успешно активирован');
				}
			});
		}
	}
});

};