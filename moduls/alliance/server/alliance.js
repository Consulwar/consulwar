initAllianceServer = function() {
'use strict';

initAllianceLib();
initAllianceServerMethods();

Game.Alliance.Collection._ensureIndex({
	name: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	url: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	tag: 1,
	deleted: 1
});

Game.Alliance.Collection._ensureIndex({
	_id: 1,
	deleted: 1
});


Game.Alliance.create = function(user, options) {
	let id = Game.Alliance.Collection.insert({
		owner: user.username,
		name: options.name,
		url: options.url,
		tag: options.tag,
		type: options.type,
		information: options.information,
		level: 1,
		participants: [],
		timestamp: Game.getCurrentTime()
	});

	Game.Alliance.addParticipant(options.url, user.username);

	return id;
};

Game.Alliance.get = function(id) {
	return Game.Alliance.Collection.findOne({
		_id: id,
		deleted: { $exists: false }
	});
};

Game.Alliance.getByUrl = function(url) {
	return Game.Alliance.Collection.findOne({
		url,
		deleted: { $exists: false }
	});
};

Game.Alliance.addParticipant = function(allianceUrl, username) {
	Game.Alliance.Collection.update({
		url: allianceUrl,
		deleted: { $exists: false }
	},{
		$push: {
			participants: username
		}
	});

	Meteor.users.update({
		username: username
	}, {
		$set: {
			alliance: allianceUrl
		}
	});
};

Game.Alliance.removeParticipant = function(allianceUrl, username) {
	Game.Alliance.Collection.update({
		url: allianceUrl,
		deleted: { $exists: false }
	},{
		$pull: {
			participants: username
		}
	});

	Meteor.users.update({
		username: username
	}, {
		$unset: {
			alliance: 1
		}
	});
};

Game.Alliance.calculateAllRating = function() {
	let alliances = Game.Alliance.getAll().fetch();

	let alliancesByUrl = {};
	for (let alliance of alliances) {
		alliancesByUrl[alliance.url] = alliance;
	}

	let updates = {};

	let users = Meteor.users.find({
		alliance: { $exists: true }
	}).fetch();

	for (let user of users) {
		let allianceUrl = user.alliance;
		if (!updates[allianceUrl]) {
			updates[allianceUrl] = {
				rating: 0,
				ownerPosition: 0
			};
		}

		updates[allianceUrl].rating += user.rating;

		let alliance = alliancesByUrl[allianceUrl];
		if (user.username === alliance.owner) {
			updates[allianceUrl].ownerPosition = Game.Statistic.getUserPositionInRating('general', user).position;
		}
	}

	let bulkOp = Game.Alliance.Collection.rawCollection().initializeUnorderedBulkOp();

	for (let alliance of alliances) {
		let update = updates[alliance.url];

		bulkOp.find({
			_id: alliance._id
		}).update({
			$set: {
				rating: update.rating,
				owner_position: update.ownerPosition
			}
		});
	}

	bulkOp.execute(function(err, data) {});
};

Game.Alliance.giveCardsForParticipants = function() {
	let alliances = Game.Alliance.getAll().fetch();

	let alliancesByUrl = {};
	for (let alliance of alliances) {
		alliancesByUrl[alliance.url] = alliance;
	}

	let users = Meteor.users.find({
		alliance: { $exists: true }
	}).fetch();

	for (let user of users) {
		let alliance = alliancesByUrl[user.alliance];

		if (alliance.daily_card) {
			Game.Cards.add({[alliance.daily_card]: 1}, user._id);
		}
	}
};

SyncedCron.add({
	name: 'Расчет рейтинга альянсов и выдача карточек',
	schedule: function(parser) {
		return parser.text(Game.Alliance.UPDATE_SCHEDULE);
	},
	job: function() {
		Game.Alliance.calculateAllRating();
		Game.Alliance.giveCardsForParticipants();
	}
});

initAllianceContactServer();

};