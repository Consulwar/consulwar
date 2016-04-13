initColosseumServer = function() {

initColosseumLib();

Meteor.methods({
	'colosseum.startTournament': function(id) {
		var user = Meteor.user();

		if (!user || !user._id) {
			throw new Meteor.Error('Требуется авторизация');
		}

		if (user.blocked == true) {
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

		// check chance
		var reward = {};

		if (Game.Random.interval(1, 99) <= tournament.drop.chance + Game.Colosseum.getBonusChance()) {
			// drop artefacts
			var artefacts = [];

			for (var key in Game.Artefacts.items) {
				if (Game.Artefacts.items[key].group == tournament.drop.itemGroup) {
					artefacts.push(key);
				}
			}

			var itemKey = artefacts[ Game.Random.interval(0, artefacts.length - 1) ];
			var itemAmount = Game.Random.interval(
				tournament.drop.minAmount,
				tournament.drop.maxAmount
			);

			reward[itemKey] = itemAmount;
		} else {
			// drop reward
			reward = tournament.reward;
		}

		// add reward
		Game.Resources.add(reward);

		return reward;
	}
});

}