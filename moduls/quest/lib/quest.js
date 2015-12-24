initQuestLib = function() {

game.Quest = function(options) {
	this.conditions = options.conditions;
	this.conditionText = options.conditionText;
	this.text = options.text;
	this.reward = options.reward;
	this.options = options.options;
	this.isDone = options.isDone;
};

game.Quest.status = {
	prompt: 0,
	inprogress: 1,
	canceled: 2,
	finished: 3
};

}