initAllianceReplenishmentServer = function() {
'use strict';

initAllianceReplenishmentLib();
initAllianceReplenishmentServerMethods();

Game.Alliance.Replenishment.create = function(alliance, user, resource) {
	Game.Alliance.Replenishment.Collection.insert({
		username: user.username,
		user_id: user._id,
		alliance_id: alliance._id,
		resource,
		timestamp: Game.getCurrentTime()
	});
};

};