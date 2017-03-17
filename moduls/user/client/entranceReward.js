initEntranceRewardClient = function () {

initEntranceRewardLib();
initEntranceRewardRanksContent();

let isEntranceRewardDisplayed = false;

let showEntranceReward = function() {
	let user = Meteor.user();

	let midnightDate = Game.getMidnightDate();

	if (!isEntranceRewardDisplayed 
		&& ((
				   !user.entranceReward // not get any rewards yet
				&& (midnightDate > user.createdAt) // play at least 1 day
			) || (
				   user.hasOwnProperty('entranceReward') // has rewards history
				&& midnightDate > user.entranceReward // get last reward at least yesterday
		))
	) {
		isEntranceRewardDisplayed = true;
		// TODO : ask for right page
		Meteor.call('entranceReward.getHistory', 0, function (err, history) {
			if (err) {
				isEntranceRewardDisplayed = false;
				Notifications.error(err.error);
			} else {
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
					winner: new ReactiveVar(
						history[currentRewardIndex].obj.type != 'rank' ? history[currentRewardIndex].obj : null
					)
				};

				Game.Popup.show('entranceReward', info);
			}
		});
	}
}

// Try to display on any resources changed.
// In most cases it is 1 check per minute
Game.Resources.Collection.find().observeChanges({
	changed: showEntranceReward
});

Template.entranceReward.onDestroyed(function() {
	isEntranceRewardDisplayed = false;
});

// Close popup if windows was closed in any tab
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
				isEntranceRewardDisplayed = false;
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