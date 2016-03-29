initMutualServerInvestments = function () {

Game.Investments.Collection._ensureIndex({
	user_id: 1
});

Game.Investments.Collection._ensureIndex({
	investments: -1
});

Game.Investments.add = function(item) {
	Game.Investments.initialize(item);

	var inc = {
		investments: parseInt(item.investments)
	};

	for (var resource in item.price) {
		inc['resources.' + resource] = parseInt(item.price[resource]);
	}

	Game.Investments.Collection.update({
		user_id: Meteor.userId(),
		group: item.group,
		engName: item.engName
	}, {
		$inc: inc
	});

	Game.Mutual.add(item);

	return inc;
}

Game.Investments.initialize = function(item) {
	var currentValue = Game.Investments.getValue(item);

	var user = Meteor.user();

	if (currentValue == undefined) {
		Game.Investments.Collection.insert({
			user_id: user._id,
			username: user.username,
			group: item.group,
			engName: item.engName,
			investments: 0,
			resources: {}
		});
	}
}

Meteor.publish('topInvestors', function(item) {
	if (this.userId) {
		return Game.Investments.getTopInvestors(item);
	}
});

}