initAllianceRequestsLib = function() {
'use strict';

Game.Alliance.Requests = {
	Collection: new Meteor.Collection('alliance_requests'),

	status: {
		SENT: 0,
		INVALIDATED: 1,
		ACCEPTED: 2,
		DECLINED: 3
	}
};

};