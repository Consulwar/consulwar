import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initBuildingSpecialColosseumServer = function() {
'use strict';

initBuildingSpecialColosseumLib();

Meteor.methods({
  'colosseum.startTournament': function(id) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'colosseum.startTournament', user });

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