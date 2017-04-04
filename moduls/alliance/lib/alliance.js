initAllianceLib = function() {
'use strict';

Game.Alliance = {
	Collection: new Meteor.Collection('alliances'),

	type: {
		PUBLIC: 0,
		OPEN: 1,
		PRIVATE: 2
	}
};

initAllianceConfigLib();
};