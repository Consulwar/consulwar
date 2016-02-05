initQuestServer = function() {

initQuestLib();

Game.Quest.regularQuests = {};
Game.Quest.dailyQuests = {};

game.QuestLine = function(options, quests) {
	if (!options.engName) {
		throw new Error('Не указано имя цепочки заданий');
	}

	if (Game.Quest.regularQuests[options.engName] != undefined) {
		throw new Error('Цепочка заданий с именем ' + options.engName + ' уже существует');
	}

	if (quests.length == 0) {
		throw new Error('Нет ни одного задания в цепочке ' + options.engName);
	}

	var questsMap = {};

	for (var i = 0; i < quests.length; i++) {
		if (!quests[i].engName) {
			throw new Error('Не указано имя задания внутри цепочки ' + options.engName + ' индекс ' + i);
		}

		if (questsMap[quests[i].engName]) {
			throw new Error('Два одинаковых имени ' + quests[i].engName + ' внутри цепочки заданий ' + options.engName);
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

	this.firstStep = function() {
		return this.quests[0];
	}

	this.findStep = function(engName) {
		var i = this.questsMap[engName];
		return (i >= 0 && i < this.quests.length) ? this.quests[i] : null;
	}

	this.nextStep = function(engName) {
		var i = this.questsMap[engName];
		return (i >= 0 && i < this.quests.length - 1) ? this.quests[i + 1] : null;
	}
}

game.DailyQuest = function(options) {
	this.engName = options.engName;
	this.name = options.name;
	this.text = options.text;
	this.answers = options.answers;
	this.who = options.who || 'tamily';

	if (!this.engName) {
		throw new Error('Не указано имя задания!');
	}

	if (Game.Quest.dailyQuests[this.engName] != undefined) {
		throw new Error('Ежедневное задание с именем ' + this.engName + ' уже существует');
	}

	Game.Quest.dailyQuests[this.engName] = this;
}

initQuestContent();

// -----------------------------------------------------------------------------

Game.Quest.initialize = function(user) {
	user = user || Meteor.user();
	var quests = Game.Quest.getValue();

	if (quests == undefined) {
		Game.Quest.Collection.insert({
			user_id: user._id,
			current: {},
			finished: {}
		});
	}
}

Meteor.methods({
	'quests.update': function() {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var quests = Game.Quest.getValue();

		if (!quests) {
			throw new Meteor.Error('Не инициализированы квесты');
		}
		
		// check inprogress quest lines
		for (var key in quests.current) {
			var current = quests.current[key];

			if (current.status != Game.Quest.status.INPROGRESS) {
				continue;
			}

			var questLine = Game.Quest.regularQuests[key];
			var quest = questLine.findStep(current.step);

			if (quest.isDone()) {
				current.status == Game.Quest.status.FINISHED;
			}
		}

		// try to start new quest line
		for (var key in Game.Quest.regularQuests) {
			var questLine = Game.Quest.regularQuests[key];

			if (quests.current[key] || quests.finished[key] || !questLine.canStart()) {
				continue;
			}

			var firstStep = questLine.firstStep();

			if (!firstStep) {
				continue;
			}

			quests.current[key] = {
				status: Game.Quest.status.PROMPT,
				step: firstStep.engName
			}
		}

		Game.Quest.Collection.update({ user_id: user._id }, quests);
	},

	'quests.sendAction': function(questId, action) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
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
			} else {
				// cancel whole quest line
				current.status = Game.Quest.status.CANCELED;
				quests.finished[questId] = current;
				delete quests.current[questId];
			}

			Game.Quest.Collection.update({ user_id: user._id }, quests);
		}
	},

	'quests.getReward': function(questId) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var quests = Game.Quest.getValue();

		if (!quests) {
			throw new Meteor.Error('Не инициализированы квесты');
		}

		var current = quests.current[questId];

		if (current && current.status == Game.Quest.status.FINISHED) {
			var questLine = Game.Quest.regularQuests[questId];
			var nextStep = questLine.nextStep(current.step);

			if (nextStep) {
				// save quest step at history
				if (!current.history) {
					current.history = {};
				}
				current.history[nextStep.engName] = Game.Quest.status.FINISHED;
				// put next step
				current.status = Game.Quest.status.PROMPT;
				current.step = nextStep.engName;
			} else {
				// move quest line to finished
				quests.finished[questId] = current;
				delete quests.current[questId];
			}

			Game.Quest.Collection.update({ user_id: user._id }, quests);
		}
	},

	'quests.getInfo': function(questId, stepName) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var questLine = Game.Quest.regularQuests[questId];

		if (!questLine) {
			throw new Meteor.Error('Нет такой цепочки заданий');
		}

		var quest = questLine.findStep(stepName);
		if (!quest) {
			throw new Meteor.Error('Нет такого задания в цепочке');
		}

		return quest;
	}
})

Meteor.publish('quest', function () {
	if (this.userId) {
		return Game.Quest.Collection.find({
			user_id: this.userId
		})
	}
});

}