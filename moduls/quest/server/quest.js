initQuestServer = function() {

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

// -----------------------------------------------------------------------------

Game.Quest.initialize = function(user) {
	user = user || Meteor.user();
	var data = Game.Quest.getValue();

	if (data == undefined) {
		Game.Quest.Collection.insert({
			user_id: user._id,
			current: {},
			finished: {}
		});
	}
}

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