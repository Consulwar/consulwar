initQuestClient = function () {

initQuestLib();

Meteor.subscribe('quest');

var isLoading = new ReactiveVar(false);
var loadedQuest = new ReactiveVar(null);

Game.Quest.showDailyQuest = function() {
	isLoading.set(false);
	loadedQuest.set(null);

	var dailyQuest = Game.Quest.getDaily();

	if (dailyQuest.status == Game.Quest.status.INPROGRESS) {
		// show inprogress daily quest
		Blaze.renderWithData(
			Template.quest, 
			{
				who: dailyQuest.who || 'tamily',
				type: 'daily',
				title: dailyQuest.name,
				isPrompt: true
			}, 
			$('.over')[0]
		);

		// load full info
		isLoading.set(true);
		Meteor.call('quests.getDailyInfo', function(err, quest) {
			isLoading.set(false);
			loadedQuest.set(quest);
		});
	} else {
		// show finished daily quest
		Blaze.renderWithData(
			Template.quest, 
			{
				who: dailyQuest.who || 'tamily',
				type: 'daily',
				title: dailyQuest.name, 
				text: dailyQuest.result
			}, 
			$('.over')[0]
		);
	}
}

Game.Quest.showQuest = function(id) {
	var currentQuest = Game.Quest.getOneById(id);
	if (!currentQuest) {
		return; // no active quest with given id
	}

	if (currentQuest.status == Game.Quest.status.FINISHED) {
		// quest finished, render reward popup
		Blaze.renderWithData(
			Template.reward, 
			{
				type: 'quest',
				engName: currentQuest.engName,
				who: currentQuest.who
			}, 
			$('.over')[0]
		);
	} else {
		// quest not finished, render reqular quest window
		Blaze.renderWithData(
			Template.quest, 
			{
				type: 'quest',
				engName: currentQuest.engName,
				who: currentQuest.who,
				title: currentQuest.name,
				isPrompt: currentQuest.status == Game.Quest.status.PROMPT
			}, 
			$('.over')[0]
		);
	}

	// load full info
	isLoading.set(true);
	loadedQuest.set(null);

	Meteor.call('quests.getInfo', currentQuest.engName, currentQuest.step, function(err, data) {
		isLoading.set(false);
		loadedQuest.set( new game.Quest(data) );
	});
}

Game.Quest.showGreeteing = function(who) {
	isLoading.set(false);
	loadedQuest.set(null);

	// show character greeting text
	var text = Game.Persons[who].text;
	if (text && text.length > 0) {
		Blaze.renderWithData(
			Template.quest, 
			{
				who: who,
				type: 'quest',
				text: text
			}, 
			$('.over')[0]
		);
	}
}

Template.quest.helpers({
	isLoading: function() { return isLoading.get(); },

	options: function() {
		if (isLoading.get()) {
			return null; // don't show options during loading
		}

		var quest = loadedQuest.get();
		if (!quest) {
			return null; // quest not loaded
		}

		// daily quest answers
		if (quest.answers) {
			return _.map(quest.answers, function(text, name) {
				return {
					name: name,
					text: text,
					mood: 'neutral'
				};
			});
		}

		// regular quest options
		if (quest.options) {
			return _.map(quest.options, function(values, name) {
				values.name = name;
				return values;
			});
		}

		return null;
	},

	text: function() {
		var quest = loadedQuest.get();
		return quest ? quest.text : this.text;
	},

	reward: function() {
		var quest = loadedQuest.get();
		return quest ? quest.reward : this.reward;
	},

	characterName: function(who) {
		return Game.Persons[who] ? Game.Persons[who].name : null;
	}
});

Template.quest.events({
	'click a': function(e, t) {
		if (t.data.type == 'quest') {
			// send reqular quest action and close popup
			Meteor.call('quests.sendAction', t.data.engName, e.target.dataset.option);
			Blaze.remove(t.view);
		} else {
			// send daily quest answer and render result
			isLoading.set(true);
			Meteor.call('quests.sendDailyAnswer', e.target.dataset.option, function(err, result) {
				isLoading.set(false);
				loadedQuest.set(result);
			})
		}
	},

	'click .close': function(e, t) {
		Blaze.remove(t.view);
	}
});

Template.reward.helpers({
	isLoading: function() { return isLoading.get(); },

	reward: function() {
		var quest = loadedQuest.get();
		return quest ? quest.reward : null;
	}
})

Template.reward.events({
	'click .close, click .take': function(e, t) {
		Meteor.call('quests.getReward', t.data.engName);
		Blaze.remove(t.view);
	}
});

}