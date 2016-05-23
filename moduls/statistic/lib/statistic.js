initStatisticLib = function() {

Game.Statistic = {
	Collection: new Meteor.Collection('statistic'),

	getUser: function() {
		return Game.Statistic.Collection.findOne({
			user_id: Meteor.userId()
		});
	},

	getUserValue: function(field, statistic) {
		if (statistic === undefined) {
			statistic = Game.Statistic.getUser();
		}

		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	},

	getSystem: function() {
		return Game.Statistic.Collection.findOne({
			user_id: 'system'
		});
	},

	getSystemValue: function(field, statistic) {
		if (statistic === undefined) {
			statistic = Game.Statistic.getSystem();
		}
		
		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	}
};

};