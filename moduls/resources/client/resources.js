initResourcesClient = function() {

initResourcesLib();
initArtefactsLib();

Meteor.subscribe('resources');

Game.Resources.currentValue = new ReactiveVar(Game.Resources.getValue());

Tracker.autorun(function(){
	var baseValue = Game.Resources.getValue();
	if (Meteor.user() && baseValue) {
		var income = Game.Resources.getIncome();
		var currentTime = Session.get('serverTime');
		var delta = currentTime - baseValue.updated;

		baseValue.humans = Game.Resources.calculateFinalAmount(
			baseValue.humans.amount, 
			income.humans, 
			delta,
			baseValue.humans.bonusSeconds
		);

		baseValue.crystals = Game.Resources.calculateFinalAmount(
			baseValue.crystals.amount, 
			income.crystals, 
			delta,
			baseValue.crystals.bonusSeconds,
			baseValue.crystals.bonus
		);

		baseValue.metals = Game.Resources.calculateFinalAmount(
			baseValue.metals.amount, 
			income.metals, 
			delta,
			baseValue.metals.bonusSeconds,
			baseValue.metals.bonus
		);

		baseValue.credits = Game.Resources.calculateFinalAmount(
			baseValue.credits.amount, 
			income.credits, 
			delta,
			baseValue.credits.bonusSeconds
		);

		Game.Resources.currentValue.set(baseValue);
	}
});

Template.current_resources.events({
	'click .resources .credits': function(e, t) {
		Game.Payment.showWindow();
	}
});

Template.current_resources.helpers({
	resources: function() { return Game.Resources.currentValue.get(); },
	incomeEffects: function() { return Game.Resources.getIncome().effects; }
});

}