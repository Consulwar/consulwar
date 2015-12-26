initMutualServerInvestments = function () {

Game.Investments.set = function(item) {
	Game.Investments.initialize(item);

	var currentValue = Game.Investments.getValue(item);

	var set = {
		investments: parseInt((currentValue.investments || 0) + item.investments)
	};

	for (var resource in item.price) {
		set['resources.' + resource] = parseInt((currentValue.resources[resource] || 0) + item.price[resource])
	}

	//console.log(item, set);

	Game.Investments.Collection.update({
		user_id: Meteor.userId(),
		group: item.group,
		engName: item.engName
	}, {
		$set: set
	});

	Game.Mutual.add(item);

	return set;
}

Game.Investments.add = function(item) {
	return Game.Investments.set(item);
}

Game.Investments.initialize = function(item) {
	var currentValue = Game.Investments.getValue(item);

	var user = Meteor.user();

	if (currentValue == undefined) {
		Game.Investments.Collection.insert({
			user_id: user._id,
			login: user.login,
			group: item.group,
			engName: item.engName,
			investments: 0,
			resources: {

			}
		})
	}
}


Meteor.publish('topInvestors', function(item) {
	if (this.userId) {
		return Game.Investments.getTopInvestors(item);
	}
});

}