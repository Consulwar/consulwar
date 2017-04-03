initCardsClient = function() {
'use strict';

initCardsLib();
Meteor.subscribe('cards');

};