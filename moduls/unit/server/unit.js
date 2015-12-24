initUnitServer = function() {

initUnitLib();
initUnitServerMethods();

Game.Unit.set = function(unit, invertSign) {
	invertSign = invertSign == true ? -1 : 1;
	Game.Unit.initialize();

	var currentValue = Game.Unit.get(unit.group, unit.engName);

	var set = {};

	set[unit.group + '.' + unit.engName] = parseInt(currentValue + (unit.count) * invertSign);

	Game.Unit.Collection.update({'user_id': Meteor.userId()}, {$set: set});

	return set;
}

Game.Unit.add = function(unit) {
	return Game.Unit.set(unit, false);
}

Game.Unit.remove = function(unit) {
	return Game.Unit.set(unit, true);
}

Game.Unit.initialize = function(user) {
	user = user || Meteor.user();
	var currentValue = Game.Unit.getValue();

	if (currentValue == undefined) {
		Game.Unit.Collection.insert({
			'user_id': user._id
		})
	}
}


Meteor.publish('units', function () {
	if (this.userId) {
		return Game.Unit.Collection.find({user_id: this.userId});
	}
});

}