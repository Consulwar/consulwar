initBuildingsSpecialColosseumClient = function() {

initBuildingsSpecialColosseumLib();

Template.colosseum.helpers({
	tournaments: function() {
		return _.map(Game.Colosseum.tournaments, function(item) {
			return item;
		});
	},

	timeCooldown: function() {
		var user = Meteor.user();
		var level = Game.Building.items.residential.colosseum.currentLevel();
		var timeLeft = user.timeLastTournament - Session.get('serverTime') + Game.Colosseum.getCooldownPeriod(level);
		return timeLeft > 0 ? timeLeft : null;
	}
});

Template.colosseum.events({
	'click .start': function(e, t) {
		var item = Game.Colosseum.tournaments[ e.currentTarget.dataset.id ];

		if (!item || !item.checkLevel()) {
			Notifications.error('Недостаточный уровень Колизея');
			return;
		}

		if (!item.checkPrice()) {
			Notifications.error('Недостаточно чести');
			return;
		}

		if (!Game.Colosseum.checkCanStart()) {
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
				Blaze.renderWithData(
					Template.colosseumReward,
					{
						reward: profit.resources
					}, 
					$('.over')[0]
				);
			}
		});
	}
});

Template.colosseumReward.helpers({
	artefact: function() {
		var key = _.keys(this.reward)[0];

		if (!Game.Artefacts.items[key]) {
			return null;
		}

		return {
			engName: key,
			amount: this.reward[key],
			group: Game.Artefacts.items[key].group
		};
	}
});

Template.colosseumReward.events({
	'click .close, click .take': function(e, t) {
		Blaze.remove(t.view);
	}
});

};