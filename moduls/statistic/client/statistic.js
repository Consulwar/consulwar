initStatisticClient = function() {
	
initStatisticLib();

Meteor.subscribe('statistic');

Game.Statistic.get = function(field) {
	var statistic = Game.Statistic.Collection.findOne();
	return (statistic && statistic[ field ]) ? statistic[ field ] : null;
}

}