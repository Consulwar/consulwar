initStatisticClient = function() {

initRatingClient();
initStatisticLib();

Meteor.subscribe('statistic');

initAchievementsClient();

};