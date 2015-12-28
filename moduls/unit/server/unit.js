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
			user_id: user._id,
			location: Game.Unit.location.HOME
		})
	}
}

Game.Unit.slice = function(sourceId, destUnits, destLocation) {

	if (destLocation == Game.Unit.location.HOME) {
		return; // Only one HOME location allowed!
	}

	var source = Game.Unit.Collection.findOne({
		_id: sourceId
	});

	if (!source) {
		return; // No such document!
	}

	var totalCount = 0;

	for (var group in destUnits) {
		for (var name in destUnits[group]) {

			var count = parseInt(destUnits[group][name], 10);

			if (!source[group] || !source[group][name]) {
				source[group][name] = 0;
			}
			 
			if (count > source[group][name]) {
				count = source[group][name];
			}

			destUnits[group][name] = count;
			source[group][name] -= count;

			totalCount += count;
		}
	}

	if (totalCount <= 0) {
		return; // Nothing to insert or update!
	}

	// update source
	Game.Unit.Collection.update({ _id: sourceId }, source);

	// insert new slice
	destUnits.user_id = Meteor.userId();
	destUnits.location = destLocation;

	return Game.Unit.Collection.insert(destUnits);
}

Game.Unit.merge = function(sourceId, sourceUnits, destId) {

	var source = Game.Unit.Collection.findOne({
		_id: sourceId
	});

	var dest = Game.Unit.Collection.findOne({
		_id: destId
	});

	if (!source || !dest) {
		return; // No such documents!
	}

	var restCount = 0;
	var mergeCount = 0;

	for (var group in sourceUnits) {
		for (var name in sourceUnits[group]) {

			if (!source[group] || !source[group][name]) {
				continue;
			}

			var count = parseInt(sourceUnits[group][name], 10);

			if (count > source[group][name]) {
				count = source[group][name];
			}

			dest[group][name] += count;
			source[group][name] -= count;

			restCount += source[group][name];
			mergeCount += count;
		}
	}

	// update source
	if (restCount > 0 || source.location == Game.Unit.location.HOME) {
		Game.Unit.Collection.update({ _id: sourceId }, source);
	} else {
		Game.Unit.Collection.remove({ _id: sourceId });
	}

	// update destination
	if (mergeCount > 0) {
		Game.Unit.Collection.update({ _id: destId }, dest);
	}
}

Meteor.publish('units', function () {
	if (this.userId) {
		return Game.Unit.Collection.find({user_id: this.userId});
	}
});

}