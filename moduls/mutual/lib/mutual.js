Meteor.startup(function () {

Game.Global = {
	Collection: new Meteor.Collection('global'),

	getValue: function(group) {
		return Game.Global.Collection.findOne({group: group});
	},

	get: function(group, name) {
		var item = Game.Global.getValue(group);

		if (item && item[name]) {
			return item[name];
		} else {
			return 0;
		}
	},

	has: function(group, name, level) {
		level = level || 1;
		return Game.Global.get(group, name) >= level;
	},

	items: {}
}

Game.Investments = {
	Collection: new Meteor.Collection('investments'),

	getValue: function(item) {
		return Game.Investments.Collection.findOne({
			user_id: Meteor.userId(),
			group: item.group,
			engName: item.engName
		});
	},

	getTopInvestors: function(item) {
		return Game.Investments.Collection.find({
			group: item.group,
			engName: item.engName
		}, {
			sort: {
				investments: -1
			},
			limit: 5
		});
	},

	items: {}
/*
	get: function(group, name) {
		var item = Game.Global.getValue(group);

		if (item && item[name]) {
			return item[name];
		} else {
			return 0;
		}
	},

	has: function(group, name, level) {
		level = level || 1;
		return Game.Global.get(group, name) >= level;
	}*/
}

});