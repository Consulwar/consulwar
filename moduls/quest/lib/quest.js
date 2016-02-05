initQuestLib = function() {

game.Quest = function(options) {
	this.engName = options.engName;
	this.conditions = options.conditions;
	this.conditionText = options.conditionText;
	this.text = options.text;
	this.reward = options.reward;
	this.options = options.options;
	this.isDone = options.isDone;
};

// ------------------------------------
// TODO: Remove later!
game.Quest.status = {
	prompt: 0,
	inprogress: 1,
	canceled: 2,
	finished: 3
};
// ------------------------------------

Game.Quest = {
	Collection: new Meteor.Collection('quest'),

	status: {
		PROMPT: 0,
		INPROGRESS: 1,
		CANCELED: 2,
		FINISHED: 3
	},

	getValue: function() {
		return Game.Quest.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	checkFinished: function(id) {
		var quests = Game.Quest.getValue;
		return (quests && quests.finished && quests.finished[id]) ? true : false;
	}
}

}