initAllianceReplenishmentHistoryServer = function() {
'use strict';

initAllianceReplenishmentHistoryLib();
initAllianceReplenishmentHistoryServerMethods();

Game.Alliance.ReplenishmentHistory.create = function(alliance, user, resource) {
  Game.Alliance.ReplenishmentHistory.Collection.insert({
    username: user.username,
    user_id: user._id,
    alliance_id: alliance._id,
    resource,
    timestamp: Game.getCurrentTime()
  });
};

};