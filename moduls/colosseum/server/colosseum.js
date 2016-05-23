initColosseumServer = function() {

initColosseumLib();

Meteor.methods({
	'colosseum.startTournament': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		var tournament = Game.Colosseum.tournaments[id];

		if (!tournament) {
			throw new Meteor.Error('Нет такого турнира');
		}

		Meteor.call('actualizeGameInfo');

		if (!Game.Colosseum.checkCanStart()
		 || !tournament.checkLevel()
		 || !tournament.checkPrice()
		) {
			throw new Meteor.Error('Невозможно начать турнир');
		}

		// spend resources
		Game.Resources.spend(tournament.price);

		// update time
		Meteor.users.update({
			_id: user._id
		}, {
			$set: {
				timeLastTournament: Game.getCurrentTime()
			}
		});

		// add reward
		var profit = Game.Resources.rollProfit(tournament.drop);
		if (profit) {
			Game.Resources.addProfit(profit);
		}

		return profit;
	}
});

};