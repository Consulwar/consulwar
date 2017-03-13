initEntranceRewardClient = function () {

initEntranceRewardLib();
initEntranceRewardRanksContent();

Meteor.users.find().observeChanges({
	changed: function(id, fields) {
		let user = Meteor.user();
		console.log('user updated!', id, fields);
		if (user._id == id) {
			if ((
					   !user.entranceReward // not get any rewards yet
					&& (Game.getMidnightDate() > user.createdAt) // play at least 1 day
				) || (
					   fields.hasOwnProperty('entranceReward') // has rewards history
					&& Game.getMidnightDate() > fields.entranceReward // get last reward at least yesterday
			)) {
				// TODO : ask for right page
				Meteor.call('entranceReward.getHistory', 0, function (err, history) {
					Game.EntranceReward.showPopup(history);
				});
			}
		}
	}
});

Game.EntranceReward.showPopup = function (history) {
	for (let i = 0; i < history.length; i++) {
		history[i] = {
			index: i,
			obj: Game.getObjectByPath(history[i].profit),
			profit: history[i].profit,
			state: history[i].state || (history[i].date ? 'taken' : 'possible')
		}
	}

	let currentRewardIndex = _.findIndex(history, function(info) {
		return info.state === 'current';
	});

	let info = {
		history,
		currentRewardIndex,
		selectedReward: new ReactiveVar(history[currentRewardIndex]),
		winner: new ReactiveVar(history[currentRewardIndex].obj.type != 'rank' ? history[currentRewardIndex].obj : null)
	};

	Game.Popup.show('entranceReward', info);
};

// Close popup if there is multiple tabs opened
Template.entranceReward.onRendered(function() {
	Meteor.users.find().observeChanges({
		changed: function(id, fields) {
			let user = Meteor.user();

			if (
				   user 
				&& user._id == id 
				&& fields.hasOwnProperty('entranceReward') 
				&& !this.data.locked
				&& Game.getMidnightDate() < fields.entranceReward
			) {
				Blaze.remove(this.view);
			}
		}.bind(this)
	});
});

Template.entranceReward.helpers({
	selectedReward: function() {
		return Template.instance().data.selectedReward.get();
	},

	winner: function() {
		return Template.instance().data.winner.get();
	},

	totalRewards: function() {
		return Game.Statistic.getUserValue('entranceReward.total');
	},

	daysLeft: function() {
		return this.selectedReward.get().index - this.currentRewardIndex;
	},

	daysPass: function() {
		return this.currentRewardIndex - this.selectedReward.get().index;
	},

	// Get nested value
	getAmount: function (obj) {
		let res = obj;
		if (_.isString(res)) {
			return null;
		} else {
			while(_.isObject(res)) {
				res = res[_.keys(res)[0]];
			}
			return res;
		}
	}
});

Template.entranceReward.events({
	'click .rewardItem': function(e, t) {
		t.data.selectedReward.set(
			t.data.history[e.currentTarget.dataset.index]
		);
	},

	'click .roll': function(e, t) {
		if (!t.data.locked) {
			t.data.locked = true;
			Meteor.call('entranceReward.takeReward', function(err, profit) {
				if (err) {
					Notifications.error(err.error);
					t.data.locked = false;
				} else {
					t.data.winner.set(Game.getObjectByPath(profit));
				}
			});
		}
	},

	'click .take, click .close': function(e, t) {
		Blaze.remove(t.view);
		Notifications.success('Награда за вход получена.'); // TODO : добавить какая награда получена
		if (!t.data.locked) {
			Meteor.call('entranceReward.takeReward');
		}
	}
});


};