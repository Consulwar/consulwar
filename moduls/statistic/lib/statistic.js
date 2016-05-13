initStatisticLib = function() {

Game.Statistic = {
	Collection: new Meteor.Collection('statistic'),

	getUserValue: function(field) {
		var statistic = Game.Statistic.Collection.findOne({
			user_id: Meteor.userId()
		});

		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	},

	getSystemValue: function(field) {
		var statistic = Game.Statistic.Collection.findOne({
			user_id: 'system'
		});
		
		return field.split('.').reduce(function(obj, key) {
			return (obj !== undefined && obj[key] !== undefined) ? obj[key] : 0;
		}, statistic);
	}
};

};