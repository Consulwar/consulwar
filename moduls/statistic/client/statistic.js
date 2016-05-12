initStatisticClient = function() {
	
initStatisticLib();

Meteor.subscribe('statistic');

Game.Statistic.getUserValue = function(field) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: Meteor.userId()
	});

	return field.split('.').reduce(function(obj, key) {
		return (obj !== undefined) ? obj[key] : obj;
	}, statistic);
};

Game.Statistic.getSystemValue = function(field) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: 'system'
	});
	
	return field.split('.').reduce(function(obj, key) {
		return (obj !== undefined) ? obj[key] : obj;
	}, statistic);
};

};