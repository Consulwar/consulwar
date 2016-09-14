initBuildingsSpecialColosseumServer = function() {

initBuildingsSpecialColosseumLib();
initBuildingsSpecialColosseumContentServer();

Meteor.methods({
	'colosseum.startTournament': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked === true) {
			throw new Meteor.Error('Аккаунт заблокирован');
		}

		console.log('colosseum.startTournament: ', new Date(), user.username);

		var tournament = Game.Building.special.Colosseum.tournaments[id];

		if (!tournament) {
			throw new Meteor.Error('Нет такого турнира');
		}

		Meteor.call('actualizeGameInfo');

		if (!Game.Building.special.Colosseum.checkCanStart()
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

		var stats = { 'colosseum.tournaments.total': 1 };
		stats['colosseum.tournaments.' + tournament.engName] = 1;

		Game.Statistic.incrementUser(user._id, stats);

		return profit;
	}
});

};