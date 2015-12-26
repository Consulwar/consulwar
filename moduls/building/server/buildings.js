initBuildingServer = function() {

initBuildingLib();

Game.Building.set = function(building) {
	Game.Building.initialize();

	var set = {};
	
	set[building.group + '.' + building.engName] = building.level

	Game.Building.Collection.update({user_id: Meteor.userId()}, {$set: set});

	return set;
}

Game.Building.add = function(building) {
	return Game.Building.set(building);
}

Game.Building.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Building.getValue();

	if (currentValue == undefined) {
		Game.Building.Collection.insert({
			'user_id': user._id
		})
	}
}


Meteor.publish('buildings', function () {
	if (this.userId) {
		return Game.Building.Collection.find({user_id: this.userId});
	}
});

initBuildingServerMethods();

}