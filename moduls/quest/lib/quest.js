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

	getByHero: function(who) {
		var quests = Game.Quest.getValue();
		var result = null;

		if (quests && quests.current) {
			for (var key in quests.current) {
				if (quests.current[key].who == who) {
					// get quest with max status
					if (!result || quests.current[key].status > result.status) {
						result = quests.current[key];
					}
				}
			}
		}

		return result;
	},

	hasDaily: function() {
		var quests = Game.Quest.getValue();
		if (quests
		 && quests.daily
		 && quests.daily.status != Game.Quest.status.FINISHED
		) {
			return true;
		}
		return false;
	},

	getDaily: function() {
		var quests = Game.Quest.getValue();
		if (quests && quests.daily) {
			return quests.daily;
		}
		return null;
	},

	checkFinished: function(id) {
		var quests = Game.Quest.getValue;
		return (quests && quests.finished && quests.finished[id]) ? true : false;
	}
}

}