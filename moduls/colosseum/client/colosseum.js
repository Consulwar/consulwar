initColosseumClient = function() {

initColosseumLib();

Game.Colosseum.showTournaments = function() {
	Router.current().render('colosseum', { to: 'buildingMenu' });
}

Game.Colosseum.hideTournaments = function() {
	Router.current().render(null, { to: 'buildingMenu' });
}

Template.colosseum.helpers({
	tournaments: function() {
		return _.map(Game.Colosseum.tournaments, function(item) {
			return item;
		});
	}
});

Template.colosseum.events({
	'click .btn-close-horizontal': function(e, t) {
		e.preventDefault();
		Game.Colosseum.hideTournaments();
	},

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

}