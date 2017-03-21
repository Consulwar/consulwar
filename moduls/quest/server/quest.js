initQuestServer = function() {
'use strict';

initQuestLib();

Game.Quest.Collection._ensureIndex({
	user_id: 1
});

Game.Quest.regularQuests = {};
Game.Quest.dailyQuests = {};

game.QuestLine = function(options, quests) {
	this.constructor = function(options, quests) {
		if (!options.engName) {
			throw new Meteor.Error('Ошибка в контенте', 'Не указано имя цепочки заданий');
		}

		if (Game.Quest.regularQuests[options.engName] !== undefined) {
			throw new Meteor.Error('Ошибка в контенте', 'Цепочка заданий с именем ' + options.engName + ' уже существует');
		}

		if (quests.length === 0) {
			throw new Meteor.Error('Ошибка в контенте', 'Нет ни одного задания в цепочке ' + options.engName);
		}

		var questsMap = {};

		for (var i = 0; i < quests.length; i++) {
			if (!quests[i].engName) {
				throw new Meteor.Error('Ошибка в контенте', 'Не указано имя задания внутри цепочки ' + options.engName + ' индекс ' + i);
			}

			if (questsMap[quests[i].engName]) {
				throw new Meteor.Error('Ошибка в контенте', 'Два одинаковых имени ' + quests[i].engName + ' внутри цепочки заданий ' + options.engName);
			}

			questsMap[quests[i].engName] = i;
		}

		this.engName = options.engName;
		this.canStart = options.canStart;
		this.finishText = options.finishText;
		this.who = options.who || 'tamily';
		this.quests = quests;
		this.questsMap = questsMap;
		
		Game.Quest.regularQuests[this.engName] = this;
	};

	this.constructor(options, quests);

	this.firstStep = function() {
		return this.quests[0];
	};

	this.findStep = function(engName) {
		var i = this.questsMap[engName];
		return (i >= 0 && i < this.quests.length) ? this.quests[i] : null;
	};

	this.nextStep = function(engName) {
		var i = this.questsMap[engName];
		return (i >= 0 && i < this.quests.length - 1) ? this.quests[i + 1] : null;
	};
};

game.DailyQuest = function(options) {
	if (!options.engName) {
		throw new Meteor.Error('Ошибка в контенте', 'Не указано имя ежедневного задания');
	}

	if (Game.Quest.dailyQuests[options.engName] !== undefined) {
		throw new Meteor.Error('Ошибка в контенте', 'Ежедневное задание с именем ' + options.engName + ' уже существует');
	}

	this.engName = options.engName;
	this.name = options.name;
	this.text = options.text;
	this.answers = options.answers;
	this.who = options.who || 'tamily';

	Game.Quest.dailyQuests[this.engName] = this;
};

initQuestContent();

Game.Quest.initialize = function(user, isRewrite) {
	user = user || Meteor.user();
	var quests = Game.Quest.getValue();

	if (quests === undefined) {
		Game.Quest.Collection.insert({
			user_id: user._id,
			current: {},
			finished: {}
		});
	} else if (isRewrite) {
		Game.Quest.Collection.update({
			user_id: user._id
		}, {
			$set: {
				current: {},
				finished: {},
				daily: null
			}
		});
	}
};

Game.Quest.actualize = function() {
	var user = Meteor.user();

	if (!user || !user._id) {
		throw new Meteor.Error('Требуется авторизация');
	}

	if (user.blocked === true) {
		throw new Meteor.Error('Аккаунт заблокирован');
	}

	var quests = Game.Quest.getValue();

	if (!quests) {
		throw new Meteor.Error('Не инициализированы квесты');
	}
	
	var currentTime = Game.getCurrentTime();
	var key = null;
	var questLine = null;

	// check inprogress quest lines
	for (key in quests.current) {
		var current = quests.current[key];

		if (current.status != Game.Quest.status.INPROGRESS) {
			continue;
		}

		questLine = Game.Quest.regularQuests[key];
		var quest = questLine.findStep(current.step);

		if (quest.isDone()) {
			current.status = Game.Quest.status.FINISHED;
		}
	}

	// try to start new quest line
	for (key in Game.Quest.regularQuests) {
		questLine = Game.Quest.regularQuests[key];

		if (quests.current[key] || quests.finished[key] || !questLine.canStart()) {
			continue;
		}

		var firstStep = questLine.firstStep();

		if (!firstStep) {
			continue;
		}

		quests.current[key] = {
			engName: questLine.engName,
			name: firstStep.conditionText,
			status: Game.Quest.status.PROMPT,
			appearTime: currentTime,
			step: firstStep.engName,
			who: questLine.who
		};
	}

	// refresh daily quest
	var effect = Game.Effect.Special.getValue(true, { engName: 'dailyQuestCount' });
	var dailyQuestPeriod = 86400 / effect.count;

	if (!quests.daily
	 || (    quests.daily.status == Game.Quest.status.FINISHED
	      && quests.daily.startTime + dailyQuestPeriod < currentTime )
	) {
		var keys = Object.keys( Game.Quest.dailyQuests );
		var choise = keys[ Game.Random.interval(0, keys.length - 1) ];

		quests.daily = {
			engName: choise,
			status: Game.Quest.status.INPROGRESS,
			startTime: currentTime,
			name: Game.Quest.dailyQuests[choise].name,
			who: Game.Quest.dailyQuests[choise].who
		};
	}

	Game.Quest.Collection.update({ user_id: user._id }, quests);
};

Meteor.methods({
	'quests.sendAction': function(questId, action) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var quests = Game.Quest.getValue();

		if (!quests) {
			throw new Meteor.Error('Не инициализированы квесты');
		}

		var current = quests.current[questId];

		if (current && current.status == Game.Quest.status.PROMPT) {
			if (action == 'accept') {
				// start quest
				current.status = Game.Quest.status.INPROGRESS;
				current.startTime = Game.getCurrentTime();
			} else {
				// cancel whole quest line
				current.status = Game.Quest.status.CANCELED;
				quests.finished[questId] = current;
				delete quests.current[questId];
			}

			Game.Quest.Collection.update({ user_id: user._id }, quests);
			Game.Quest.actualize();
		}
	},

	'quests.getReward': function(questId) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('quests.getReward: ', new Date(), user.username);

		var quests = Game.Quest.getValue();

		if (!quests) {
			throw new Meteor.Error('Не инициализированы квесты');
		}

		var current = quests.current[questId];

		if (current && current.status == Game.Quest.status.FINISHED) {
			var questLine = Game.Quest.regularQuests[questId];
			var prevStep = questLine.findStep(current.step);
			var nextStep = questLine.nextStep(current.step);

			if (nextStep) {
				// save quest step at history
				if (!current.history) {
					current.history = {};
				}
				current.history[current.step] = {
					result: Game.Quest.status.FINISHED,
					startTime: current.startTime
				};
				// put next step
				current.status = Game.Quest.status.PROMPT;
				current.name = nextStep.conditionText;
				current.step = nextStep.engName;
				current.startTime = Game.getCurrentTime();
			} else {
				// move quest line to finished
				quests.finished[questId] = current;
				delete quests.current[questId];
			}

			Game.Quest.Collection.update({ user_id: user._id }, quests);

			// add reward
			if (prevStep && prevStep.reward) {
				Game.Resources.add(prevStep.reward);
			}

			// save statistic
			Game.Statistic.incrementUser(user._id, {
				'quests.regular.completed': 1,
				'quests.regular.completedQuestLines': ( nextStep ? 0 : 1 )
			});
		}
	},

	'quests.getInfo': function(questId, stepName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('quests.getInfo: ', new Date(), user.username);

		var questLine = Game.Quest.regularQuests[questId];

		if (!questLine) {
			throw new Meteor.Error('Нет такой цепочки заданий');
		}

		var quest = questLine.findStep(stepName);
		if (!quest) {
			throw new Meteor.Error('Нет такого задания в цепочке');
		}

		return quest;
	},

	'quests.getDailyInfo': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('quests.getDailyInfo: ', new Date(), user.username);

		var quests = Game.Quest.getValue();

		if (!quests || !quests.daily || quests.daily.status != Game.Quest.status.INPROGRESS) {
			throw new Meteor.Error('Нет ежедневного задания');
		}

		var quest = Game.Quest.dailyQuests[quests.daily.engName];
		var answers = {};

		for (var name in quest.answers) {
			answers[name] = quest.answers[name].text;
		}

		return {
			engName: quest.engName,
			who: quest.who,
			name: quest.name,
			text: quest.text,
			answers: answers
		};
	},

	'quests.sendDailyAnswer': function(answer) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('quests.sendDailyAnswer: ', new Date(), user.username);

		var quests = Game.Quest.getValue();

		if (!quests || !quests.daily || quests.daily.status != Game.Quest.status.INPROGRESS) {
			throw new Meteor.Error('Нет ежедневного задания');
		}

		check(answer, String);

		var quest = Game.Quest.dailyQuests[quests.daily.engName];

		if (quest.answers.hasOwnProperty(answer)) {
			var result = '';
			if (quest.answers[answer].win && quest.answers[answer].fail) {
				result = Math.floor( Math.random() * 2 ) == 1 ? 'win' : 'fail';
			} else if (quest.answers[answer].win) {
				result = 'win';
			} else {
				result = 'fail';
			}

			var income = Game.Resources.getIncome();

			var reward = {
				metals: result == 'win' ? Math.floor( income.metals ) : 0,
				crystals: result == 'win' ? Math.floor( income.crystals ) : 0
			};
			
			reward = Game.Effect.Special.applyTo({ engName: 'dailyQuestReward' }, reward, true);

			var set = {
				'daily.status': Game.Quest.status.FINISHED,
				'daily.result': quest.answers[answer][result]
			};

			Game.Resources.add(reward);

			Game.Quest.Collection.update({
				user_id: user._id
			}, {
				$set: set
			});

			// save statistic
			Game.Statistic.incrementUser(user._id, {
				'quests.daily.total': 1,
				'quests.daily.win': ( result == 'win' ? 1 : 0 ),
				'quests.daily.fail': ( result == 'win' ? 0 : 1 )
			});

			// return result
			return {
				text: quest.answers[answer][result],
				reward: reward
			};
		}
	}
});

Meteor.publish('quest', function () {
	if (this.userId) {
		return Game.Quest.Collection.find({
			user_id: this.userId
		});
	}
});

};