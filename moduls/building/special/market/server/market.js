import Log from '/imports/modules/Log/server/Log';
import User from '/imports/modules/User/server/User';

initBuildingSpecialMarketServer = function() {
'use strict';

initBuildingSpecialMarketLib();

Meteor.methods({
  'market.exchange': function(resourceFrom, resourceTo, amount) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'market.exchange', user });

    var userResources = Game.Resources.getValue();

    if (!userResources[resourceFrom]
     || !userResources[resourceFrom].amount
     ||  userResources[resourceFrom].amount < amount
    ) {
      throw new Meteor.Error('Недостаточно ресурсов');
    }

    var result = Game.Building.special.Market.getExchangeAmount(resourceFrom, resourceTo, amount);

    if (result <= 0) {
      throw new Meteor.Error('Невозможно совершить обмен');
    }

    var resourceSpend = {};
    resourceSpend[resourceFrom] = amount;
    Game.Resources.sold(resourceSpend);

    var resourceAdd = {};
    resourceAdd[resourceTo] = result;
    Game.Resources.bought(resourceAdd);
  }
});

};