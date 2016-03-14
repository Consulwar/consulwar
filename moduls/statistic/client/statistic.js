initStatisticClient = function() {
	
initStatisticLib();

Meteor.subscribe('statistic');

Game.Statistic.getUserValue = function(field) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: Meteor.userId()
	});
	return (statistic && statistic[ field ]) ? statistic[ field ] : null;
}

Game.Statistic.getSystemValue = function(field) {
	var statistic = Game.Statistic.Collection.findOne({
		user_id: 'system'
	});
	return (statistic && statistic[ field ]) ? statistic[ field ] : null;
}

}