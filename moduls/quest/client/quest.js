initQuestClient = function () {

initQuestLib();

Meteor.subscribe('quest');

Template.quest.helpers({
	characterName: function(who) {
		return Game.Persons[who] ? Game.Persons[who].name : null;
	}
});

Template.reward.events({
	'click .close, click .take': function(e, t) {
		Meteor.call('quests.getReward', t.data.engName);
		Blaze.remove(t.view);
	}
});

}