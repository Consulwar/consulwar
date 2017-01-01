initBuildingSpecialPulsecatcherClient = function() {

initBuildingSpecialPulsecatcherLib();

Meteor.subscribe('pulsecatcherQuiz');

Template.pulsecatcher.helpers({
	bonusList: function() {
		var activeQuiz = Game.Building.special.Pulsecatcher.getQuiz();
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

	choosenBonus: function() {
		var previousQuiz = Game.Building.special.Pulsecatcher.getQuiz(1);
		var card = Game.Building.special.Pulsecatcher.getChoosenBonus(previousQuiz);
		var activeList = Game.Building.special.Pulsecatcher.getActiveBonusList();

		var canActivate = (
			   activeList 
			&& card 
			&& (!activeList[card.engName]
				|| (
					   activeList[card.engName] 
					&& activeList[card.engName].getActiveTask().startTime < previousQuiz.endDate
				)
			)
		);

		return {
			card,
			canActivate
		};
	},

	previousBonusCard: function() {
		var previousQuiz = Game.Building.special.Pulsecatcher.getQuiz(2);
		var card = Game.Building.special.Pulsecatcher.getChoosenBonus(previousQuiz);
		var activeList = Game.Building.special.Pulsecatcher.getActiveBonusList();

		return card;
	},

	building: function() {
		return Game.Building.items.residential.pulsecatcher;
	}
});



var pulsecatcherGetBonusIsLoading = new ReactiveVar(false);

Template.pulsecatcherGetBonus.events({
	'click .activate': function(e, t) {
		if (!pulsecatcherGetBonusIsLoading.get()) {
			pulsecatcherGetBonusIsLoading.set(true);
			Meteor.call('pulsecatcher.activateBonus', function(err, result) {
				pulsecatcherGetBonusIsLoading.set(false);
				if (err) {
					Notifications.error('Не удалось активировать бонус', err.error);
				} else {
					Notifications.success('Бонус успешно активирован');
				}
			});
		}
	}
});

Template.pulsecatcherGetBonus.helpers({
	isLoading: function() { return pulsecatcherGetBonusIsLoading.get(); }
});



var pulsecatcherVoteIsLoading = new ReactiveVar(false);
var pulsecatcherVoteActiveOption = new ReactiveVar(null);

var userVote = function() {
	var activeQuiz = Game.Building.special.Pulsecatcher.getQuiz();
	if (!activeQuiz) {
		return false;
	}

	var userAnswer = Game.Quiz.Answer.Collection.findOne({
		user_id: Meteor.userId(), 
		quiz_id: activeQuiz._id
	});

	return userAnswer;
};

var calcVoteValue = function(answer) {
	var activeQuiz = Game.Building.special.Pulsecatcher.getQuiz();
	if (!activeQuiz || activeQuiz.totalVotes === 0) {
		return 0;
	}
	return Math.round( activeQuiz.result[answer] / activeQuiz.totalVotes * 100 );
};

var _updateCharts = _.debounce(function(selector) {
	if ($(selector).data('easyPieChart')) {
		$(selector).each(function(key, element) {
			$(element).data('easyPieChart').update(calcVoteValue(element.dataset.id));
		});
	} else {
		$(selector).each(function(key, element) {
			$(element).easyPieChart({
				size: 80, 
				lineWidth: 8, 
				barColor: (userVote().answer == element.dataset.id ? '#c6e84c' : '#66cce2'),
				trackColor: false, 
				scaleColor: false,
				onStep: function(from, to, percent) {
					this.el.children[0].innerHTML = Math.round(percent) + '%';
				}
			});
		});
	}
}, 10);

var updateCharts = function() {
	Meteor.setTimeout(function() {
		_updateCharts('.result');
	});
};

Template.pulsecatcherVote.onRendered(function() {
	Tracker.autorun(function() {
		var quiz = Game.Quiz.Collection.find({
			type: 'pulsecatcher'
		}, {
			sort: { endDate: -1 }
		});

		quiz.observeChanges({
			added: function(id) {
				Meteor.subscribe('pulsecatcherQuizAnswer', id);
				updateCharts('.result');
			},
			changed: updateCharts
		});

		if (quiz.fetch().length) {
			Game.Quiz.Answer.Collection.find({
				user_id: Meteor.user()._id,
				quiz_id: quiz.fetch()[0]._id
			}).observeChanges({
				added: updateCharts,
				changed: updateCharts
			});
		}
	});	
});

Template.pulsecatcherVote.events({
	'click .option': function(e, t) {
		if (!userVote()) {
			pulsecatcherVoteActiveOption.set(e.currentTarget.dataset.id);
		}
	},

	'click .vote': function(e, t) {
		var answer = pulsecatcherVoteActiveOption.get();
		var activeQuiz = Game.Building.special.Pulsecatcher.getQuiz();
		if (answer && activeQuiz && !pulsecatcherVoteIsLoading.get()) {
			pulsecatcherVoteIsLoading.set(true);
			Meteor.call('pulsecatcher.voteBonus', answer, function(err, result) {
				pulsecatcherVoteIsLoading.set(false);
				if (err) {
					Notifications.error('Не удалось проголосовать', err.error);
				} else {
					Notifications.success('Вы успешно проголосовали');

					pulsecatcherVoteActiveOption.set(null);
				}
			});
		}
	}
});

Template.pulsecatcherVote.helpers({
	isLoading: function() { return pulsecatcherVoteIsLoading.get(); },

	'activeOption': function() {
		return pulsecatcherVoteActiveOption.get();
	},

	userVote,

	calcVoteValue
});

};