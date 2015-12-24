initMailQuizClient = function () {

initMailQuizLib();

Template.quiz.events({
	'click a:not([target="_blank"])': function(e, t) {
		Meteor.call('quizAnswer', t.data.id, e.target.dataset.option, function(err, result) {
			if (err) {
				Notifications.error('Голосование не удалось', err.error);
			} else {
				Notifications.success('Вы проголосовали за «' + result.options[e.target.dataset.option] + '»');
				Blaze.remove(t.view);
				Blaze.renderWithData(
					Template.quiz, 
					{
						id: result._id,
						userAnswer: result.userAnswer,
						who: result.who || 'psm',
						type: 'quiz',
						title: result.name, 
						text: result.text, 
						options: $.map(result.options, function(value, name) {
							return {
								name: name,
								text: value,
								value: result.result[name] || 0,
								totalVotes: result.totalVotes
							};
						}),
						totalVotes: result.totalVotes,
						votePower: Game.User.getVotePower(),
						canVote: !result.userAnswer /*|| !Game.User.getVotePower() ? false : true*/
					}, 
					$('.over')[0]
				)
			}
		})
	},

	'click .close': function(e, t) {
		Blaze.remove(t.view);
	}
});

}