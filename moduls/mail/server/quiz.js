initMailQuizServer = function() {

initMailQuizLib();

Game.Quiz.Collection._ensureIndex({
	user_id: 1,
	quiz_id: 1
});

Game.Quiz.Collection._ensureIndex({
	type: 1
});

Game.Quiz.Collection._ensureIndex({
	endDate: -1
});

Game.Quiz.Answer.Collection._ensureIndex({
	user_id: 1,
	quiz_id: 1
});

/*
Meteor.call('createQuiz', {
	who: 'zav',
	name: 'подкрепление.',
	text: 'Отсылаю вам личные резервы, Консулы. У меня уйдет много времени, что бы восстановить его. Не просрите.<br/>50 000 отцов, 45 000 турникмэнов, 5 000 псиоников, 8000 бгонивечков, 10 000 изи, 800 мамок, 3 000 елдаков, 10 000 скорострелов, 7 000 бабуль. Удачи.',
	options: {
		no: 'Отказаться от подкрепления',
		yes: 'Принять подкрепление',
		more: 'Ещё!!!'
	},
	startDate: Game.getCurrentTime(),
	endDate: Game.getCurrentTime() + (60*60*24),
	result: {
		no: 0,
		yes: 0,
		more: 0
	},
	totalVotes: 0
}, function(err, res) {
	console.log(err, res);
})

Meteor.call('sendQuiz', "QHb4rZPTz9WYqp5qD");
*/

/*
Meteor.call('createQuiz', {
	startDate: Game.getCurrentTime(),
	endDate: Game.getCurrentTime() + (60*60*24),
	name: 'подкрепление.',
	questions: [{
		who: 'zav',
		title: 'подкрепление.',
		text: 'Отсылаю вам личные резервы, Консулы. У меня уйдет много времени, что бы восстановить его. Не просрите.<br/>50 000 отцов, 45 000 турникмэнов, 5 000 псиоников, 8000 бгонивечков, 10 000 изи, 800 мамок, 3 000 елдаков, 10 000 скорострелов, 7 000 бабуль. Удачи.',
		options: {
			no: 'Отказаться от подкрепления',
			yes: 'Принять подкрепление',
			more: 'Ещё!!!'
		}
	},
	{
		who: 'psm',
		title: 'нифига не подкрепление',
		text: 'А я вам нифига не отсылаю',
		options: {
			no: 'Пожаловаться заву',
			yes: 'Послать',
			more: 'Поплакать'
		}
	}]
}, function(err, res) {
	console.log(err, res);
})

Meteor.call('sendQuiz', "NRpFEtMk4crreGZvB");
*/

Meteor.methods({
	getQuiz: function(id) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('getQuiz: ', new Date(), user.username);

		check(id, String);

		var userAnswer = Game.Quiz.Answer.Collection.findOne({
			user_id: Meteor.userId(), 
			quiz_id: id
		});

		var quiz = Game.Quiz.getValue(id);

		if (userAnswer) {
			quiz.userAnswers = userAnswer.answers;
		}

		//console.log(quiz);

		return quiz;
	},

	quizAnswer: function(id, questionNum, answer) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('quizAnswer: ', new Date(), user.username);

		check(id, String);
		check(questionNum, Match.Integer);
		check(answer, String);

		var quiz = Game.Quiz.getValue(id);

		if (!quiz || !quiz.questions) {
			throw new Meteor.Error('Такого опроса не существует');
		}

		if (!quiz.questions[questionNum]) {
			throw new Meteor.Error('Такого номера вопроса не существует');
		}

		if (!quiz.questions[questionNum].options.hasOwnProperty(answer)) {
			throw new Meteor.Error('Такого ответа не существует');
		}

		if (quiz.endDate < Game.getCurrentTime()) {
			throw new Meteor.Error('Опрос уже завершен');
		}

		var userAnswer = Game.Quiz.Answer.Collection.findOne({
			user_id: Meteor.userId(), 
			quiz_id: id
		});

		if (userAnswer && userAnswer.answers &&  userAnswer.answers[questionNum]) {
			throw new Meteor.Error('Вы уже голосовали');
		}

		var votePower = Game.User.getVotePower();
		if (!userAnswer) {
			var answers = [];
			answers[questionNum] = answer;
			var dates = [];
			dates[questionNum] = Game.getCurrentTime();
			Game.Quiz.Answer.Collection.insert({
				user_id: Meteor.userId(), 
				quiz_id: id,
				answers: answers,
				power: votePower,
				dates: dates
			});
		} else {
			var set = {};
			set['answers.' + questionNum] = answer;
			set['dates.' + questionNum] = Game.getCurrentTime();
			Game.Quiz.Answer.Collection.update({_id: userAnswer._id}, {
				$set: set
			});
		}

		var inc = {};
		inc['questions.' + questionNum + '.result.' + answer] = votePower;
		inc['questions.' + questionNum + '.totalVotes'] = votePower;

		Game.Quiz.Collection.update({_id: id}, {
			$inc: inc
		});

		return Meteor.call('getQuiz', id);
	},

	createQuiz: function(options) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('createQuiz: ', new Date(), user.username);

		if (user.username != 'dreamniker') {
			throw new Meteor.Error('Ты не Zav!');
		}

		if (!_.isArray(options.questions)) {
			options.questions = [options.questions];
		}

		check(options.startDate, Match.Integer);
		check(options.endDate, Match.Integer);
		check(options.name, String);

		for (var i = 0; i < options.questions.length; i++) {
			check(options.questions[i].who, String);
			check(options.questions[i].title, String);
			check(options.questions[i].text, String);
			check(options.questions[i].options, Object);

			options.questions[i].result = _.mapObject(options.questions[i].options,function(){return 0;});
			options.questions[i].totalVotes = 0;
		}
		console.log(111);
		return Game.Quiz.Collection.insert(options);
	},

	sendQuiz: function(id) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('sendQuiz: ', new Date(), user.username);

		if (user.username != 'dreamniker') {
			throw new Meteor.Error('Ты не Zav!');
		}
		check(id, String);

		var quiz = Game.Quiz.getValue(id);

		if (!quiz) {
			throw new Meteor.Error('Такого опроса не существует');
		}

		return game.Mail.sendMessageToAll('quiz', 'Опрос: ' + quiz.name, quiz._id);
	}
});

};