initMailQuizClient = function () {

initMailQuizLib();

var reRenderQuiz = function(t, data) {
	Blaze.remove(t.view);
	Blaze.renderWithData(
		Template.quiz, 
		data, 
		$('.over').get(0)
	);
};

Template.quiz.events({
	'click a:not([target="_blank"])': function(e, t) {
		var questionNum = t.data.questionNum;
		var userAnswer = e.target.dataset.option;
		Meteor.call('quizAnswer', t.data.quiz._id, userAnswer, questionNum, function(err, result) {
			if (err) {
				Notifications.error('Голосование не удалось', err.error);
			} else {
				Notifications.success('Вы проголосовали за «' + (result.questions
					? result.questions[questionNum].options[userAnswer]
					: result.options[userAnswer]
				) + '»');
				Blaze.remove(t.view);
				Blaze.renderWithData(
					Template.quiz, 
					{
						quiz: result,
						questionNum: questionNum
					}, 
					$('.over').get(0)
				);
			}
		});
	},
	'click .next_question': function(e, t) {
		this.questionNum++;
		reRenderQuiz(t, this);
	},
	'click .previous_question': function(e, t) {
		this.questionNum--;
		reRenderQuiz(t, this);
	},
	'click .close': function(e, t) {
		Blaze.remove(t.view);
		window.history.back();
	}
});

Template.quizQuestion.helpers({
	options: function() {
		var self = this;
		return $.map(this.question.options, function(value, name) {
			return {
				name: name,
				text: value,
				value: self.question.result[name] || 0,
				totalVotes: self.question.totalVotes
			};
		});
	}
});


};