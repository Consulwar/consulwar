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
		Meteor.call('quizAnswer', t.data.quiz._id, questionNum, userAnswer, function(err, result) {
			if (err) {
				Notifications.error('Голосование не удалось', err.error);
			} else {
				//Notifications.success('Вы проголосовали за «' + result.options[e.target.dataset.option] + '»');
				result.questions[questionNum].userAnswer = userAnswer;
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
	}
});

};