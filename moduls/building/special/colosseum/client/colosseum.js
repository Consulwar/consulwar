initBuildingSpecialColosseumClient = function() {

initBuildingSpecialColosseumLib();

var selectedTournament = new ReactiveVar('green_ring');

Template.colosseum.helpers({
	tournaments: function() {
		return _.map(Game.Building.special.Colosseum.tournaments, function(item) {
			return item;
		});
	},

	timeCooldown: function() {
		var user = Meteor.user();
		var level = Game.Building.items.residential.colosseum.currentLevel();
		var timeLeft = user.timeLastTournament - Session.get('serverTime') + Game.Building.special.Colosseum.getCooldownPeriod(level);
		return timeLeft > 0 ? timeLeft : null;
	},

	building: function() {
		return Game.Building.items.residential.colosseum;
	},

	selected: function() {
		var selected = selectedTournament.get();
		return selected && Game.Building.special.Colosseum.tournaments[ selectedTournament.get() ];
	}
});

Template.colosseum.events({
	'click .tournament:not(.disabled)': function(e, t) {
		selectedTournament.set(e.currentTarget.dataset.id);
	},

	'click .start': function(e, t) {
		var item = Game.Building.special.Colosseum.tournaments[ selectedTournament.get() ];

		if (!item || !item.checkLevel()) {
			Notifications.error('Недостаточный уровень Колизея');
			return;
		}

		if (!item.checkPrice()) {
			Notifications.error('Недостаточно чести');
			return;
		}

		if (!Game.Building.special.Colosseum.checkCanStart()) {
			Notifications.error('Турнир уже проводился сегодня');
			return;
		}

		Meteor.call('colosseum.startTournament', item.engName, function(err, profit) {
			if (err) {
				Notifications.error('Не удалось провести турнир', err.error);
				return;
			}
			// show reward window
			if (profit && profit.resources) {
				Game.Popup.showPopup('colosseumReward', {
					reward: profit.resources
				});
			}
		});
	}
});

Template.colosseumReward.events({
	'click .take': function(e, t) {
		Blaze.remove(t.view);
	}
});

};