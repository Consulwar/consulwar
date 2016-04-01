initQuestClient = function () {

initQuestLib();

Meteor.subscribe('quest');

Template.quest.helpers({
	characterName: function(who) {
		return Game.Persons[who] ? Game.Persons[who].name : null;
	}
});

}