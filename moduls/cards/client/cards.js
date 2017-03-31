initCardsClient = function() {
'use strict';

initCardsMainLib();

Meteor.subscribe('cards');

};