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
	let alliances = Game.Alliance.Collection.find({
		deleted: { $exists: false }
	}, {
		fields: {
			owner: 1,
			participants: 1
		}
	}).fetch();

	for (let alliance of alliances) {
		let allianceRating = 0;

		for (let username of alliance.participants) {
			let userInfo = Meteor.users.findOne({
				username
			}, {
				fields: {
					rating: 1
				}
			});

			allianceRating += userInfo.rating;
		}

		let ownerUser = Meteor.users.findOne({
			username: alliance.owner
		});

		let position = Game.Statistic.getUserPositionInRating('general', ownerUser).position;

		Game.Alliance.Collection.update({
			_id: alliance._id
		}, {
			$set: {
				rating: allianceRating,
				owner_position: position
			}
		});
	}
};

Game.Alliance.giveCardsForParticipants = function() {
	let alliances = Game.Alliance.Collection.find({
		deleted: { $exists: false }
	}, {
		fields: {
			participants: 1
		}
	}).fetch();

	for (let alliance of alliances) {
		for (let username of alliance.participants) {
			let userInfo = Meteor.users.findOne({
				username
			}, {
				fields: {
					_id: 1
				}
			});

			Game.Cards.add({damage1: 1}, userInfo._id);
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