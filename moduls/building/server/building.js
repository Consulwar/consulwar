import '/imports/modules/Building/server/api';
import BuildingCollection from '/imports/modules/Building/lib/BuildingCollection';

initBuildingServer = function() {
'use strict';

initBuildingLib();

BuildingCollection._ensureIndex({
  user_id: 1
});

Meteor.publish('buildings', function () {
  if (this.userId) {
    return BuildingCollection.find({
      user_id: this.userId,
    });
  }
});

initBuildingSpecialMarketServer();
initBuildingSpecialColosseumServer();
initBuildingSpecialContainerServer();
initBuildingSpecialPulsecatcherServer();
};