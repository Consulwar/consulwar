initQuestServerOld = function() {

initQuestLib();

game.quests = {};
game.dailyQuests = {};

game.QuestLine = function(options, quests) {
	this.engName = options.engName;
	this.canStart = options.canStart;
	this.finishText = options.finishText;
	this.quests = quests;

	if (!this.engName) {
		throw new Error('Не указано имя задания!');
	}

	if (game.quests[this.engName] != undefined) {
		throw new Error('Квест с именем ' + this.engName + ' уже существует');
	}

	game.quests[this.engName] = this;
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

	if (game.dailyQuests[this.engName] != undefined) {
		throw new Error('Ежедневное задание с именем ' + this.engName + ' уже существует');
	}

	game.dailyQuests[this.engName] = this;
}


initQuestContent();


Meteor.methods({
	updateQuests: function() {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('updateQuests: ', new Date(), user.login);

		var user = Meteor.user();

		var set = {};

		// Обычные квесты

		if (user.game.quests.current) {
			var currentQuest = user.game.quests.current;

			if (currentQuest && currentQuest.status == game.Quest.status.inprogress) {
				var quest = game.quests[currentQuest.engName];
				if (quest.quests[currentQuest.step].isDone()) {
					set['game.quests.current.status'] = game.Quest.status.finished;
				}
			}
		} else {
			// выдаем квест
			for (var qname in game.quests) {
				if (!user.game.quests.finished[qname] && game.quests[qname].canStart()) {
					//console.log(game.quests[qname]);
					set['game.quests.current'] = {
						engName: qname,
						step: 0,
						status: game.Quest.status.prompt,
						text: game.quests[qname].quests[0].text,
						conditionText: game.quests[qname].quests[0].conditionText,
						reward: game.quests[qname].quests[0].reward,
						options: game.quests[qname].quests[0].options
					}
					break;
				}
			}
		}


		// Дейлики

		if (!user.game.quests.daily
			|| (
				user.game.quests.daily 
				&& user.game.quests.daily.status == game.Quest.status.finished 
				&& (Math.floor(new Date().valueOf() / 1000)) > (user.game.quests.daily.startTime + 14400))) {

			var keys = Object.keys(game.dailyQuests);

			//console.log(keys);

			var choise = keys[Math.floor(Math.random()*keys.length)];

			set['game.quests.daily'] = {
				engName: choise,
				who: game.dailyQuests[choise].who,
				name: game.dailyQuests[choise].name,
				status: game.Quest.status.inprogress,
				startTime: Math.floor(new Date().valueOf() / 1000)
			}

		} 

		// Глобалы //
		
		if (!_.isEmpty(set)) {
			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			});
		}
	},

	questAction: function(action) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('questAction: ', new Date(), user.login);

		var currentQuest = user.game.quests.current;

		var set = {};

		if (currentQuest && currentQuest.status == game.Quest.status.prompt) {
			if (action == 'accept') {
				set['game.quests.current.status'] = game.Quest.status.inprogress;
			} else {
				//set['game.quests.current.status'] = game.Quest.status.canceled;


				set['game.quests.current'] = null;
				set['game.quests.finished.' + currentQuest.engName] = true;
			}
		}

		if (!_.isEmpty(set)) {
			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			});
		}
	},

	getReward: function() {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('getReward: ', new Date(), user.login);

		var currentQuest = user.game.quests.current;

		var set = {};

		if (currentQuest && currentQuest.status == game.Quest.status.finished) {
			var quest = game.quests[currentQuest.engName];
			if (quest.quests.length > (currentQuest.step + 1)) {
				var step = currentQuest.step + 1;
				var qname = currentQuest.engName;
				set['game.quests.current'] = {
					engName: qname,
					step: step,
					status: game.Quest.status.prompt,
					text: game.quests[qname].quests[step].text,
					conditionText: game.quests[qname].quests[step].conditionText,
					reward: game.quests[qname].quests[step].reward,
					options: game.quests[qname].quests[step].options
				}
			} else {
				set['game.quests.current'] = null;
				set['game.quests.finished.' + currentQuest.engName] = true;
			}

			/*for (var resourse in quest.quests[currentQuest.step].reward) {
				set['game.resources.' + resourse + '.amount'] = user.game.resources[resourse].amount + quest.quests[currentQuest.step].reward[resourse];
			}*/
			Game.Resources.add(quest.quests[currentQuest.step].reward);
		}

		if (!_.isEmpty(set)) {
			Meteor.users.update({'_id': Meteor.userId()}, {
				$set: set
			});
		}
	},

	getDailyQuest: function() {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('getDailyQuest: ', new Date(), user.login);

		if (user.game.quests.daily && user.game.quests.daily.status == game.Quest.status.inprogress) {
			var quest = game.dailyQuests[user.game.quests.daily.engName];

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
			}
		}
	},

	dailyQuestAnswer: function(answer) {
		var user = Meteor.user();

		if (!(user && user._id)) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
			throw new Meteor.Error('Аккаунт заблокирован.');
		}

		console.log('dailyQuestAnswer: ', new Date(), user.login);

		check(answer, String);

		if (user.game.quests.daily && user.game.quests.daily.status == game.Quest.status.inprogress) {
			var quest = game.dailyQuests[user.game.quests.daily.engName];
			if (quest.answers.hasOwnProperty(answer)) {
				var result = '';
				if (quest.answers[answer].win && quest.answers[answer].fail) {
					result = Math.floor(Math.random()*2) == 1 ? 'win' : 'fail';
				} else if (quest.answers[answer].win) {
					result = 'win';
				} else {
					result = 'fail';
				}
				

				var income = Game.Resources.getIncome();

				var reward = {
					metals: result == 'win' ? Math.floor(income.metals) : 0,
					crystals: result == 'win' ? Math.floor(income.crystals) : 0
				}

				var set = {
					'game.quests.daily.status': game.Quest.status.finished,
					'game.quests.daily.result': quest.answers[answer][result],

					//'game.resources.metals.amount': user.game.resources.metals.amount + reward.metals,
					//'game.resources.crystals.amount': user.game.resources.crystals.amount + reward.crystals
				}

				Game.Resources.add(reward);

				Meteor.users.update({'_id': user._id}, {
					$set: set
				});

				return {
					text: quest.answers[answer][result],
					reward: reward
				};
			}
		}
	} 
});
/*
Meteor.publish('quests', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {
			fields: {
				'game.quests': 1
			}
		});
	} else {
		this.ready();
	}
});*/

}