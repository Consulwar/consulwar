initMailQuizServer = function() {

initMailQuizLib();

Game.Quiz.Collection._ensureIndex({
	user_id: 1,
	quiz_id: 1
});

Game.Quiz.Collection._ensureIndex({
	endDate: -1
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
			quiz.userAnswer = userAnswer;
		}

		//console.log(quiz);

		return quiz;
	},

	quizAnswer: function(id, answer) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('quizAnswer: ', new Date(), user.username);

		check(id, String);
		check(answer, String);

		var quiz = Game.Quiz.getValue(id);

		if (!quiz) {
			throw new Meteor.Error('Такого опроса не существует');
		}

		if (!quiz.options.hasOwnProperty(answer)) {
			throw new Meteor.Error('Такого ответа не существует');
		}

		if (quiz.endDate < Game.getCurrentTime()) {
			throw new Meteor.Error('Опрос уже завершен');
		}

		var userAnswer = Game.Quiz.Answer.Collection.findOne({
			user_id: Meteor.userId(), 
			quiz_id: id
		});

		if (userAnswer) {
			throw new Meteor.Error('Вы уже голосовали');
		}

		var votePower = Game.User.getVotePower();

		Game.Quiz.Answer.Collection.insert({
			user_id: Meteor.userId(), 
			quiz_id: id,
			answer: answer,
			power: votePower,
			date: Game.getCurrentTime()
		});

		var inc = {};
		inc['result.' + answer] = votePower;
		inc.totalVotes = votePower;

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

		if (user.username != 'Zav') {
			throw new Meteor.Error('Ты не Zav!');
		}

		return Game.Quiz.Collection.insert({
			who: options.who,
			name: options.name,
			text: options.text,
			options: options.options,
			startDate: options.startDate,
			endDate: options.endDate,
			result: options.result,
			totalVotes: 0
		});
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

		if (user.username != 'Zav') {
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