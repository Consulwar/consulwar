initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticTab = new ReactiveVar(null);
var detailStatisticData = new ReactiveVar(null);
var users = new ReactiveVar();
var countTotal = new ReactiveVar(false);
var reactiveSelectedUserName = new ReactiveVar(false);
var lastPageNumber;
var countPerPage = 20;

Game.Rating = {};

Game.Rating.showPage = function() {
	this.render('rating', { to: 'content' });

	var pageNumber = parseInt( this.params.page, 10 );
	var hash = this.getParams().hash;
	var selectedUserName;
	var detail = false;

	if (hash) {
		var hashArray = hash.split('/');
		selectedUserName = hashArray[0];
		if (hashArray[1] == 'detail') {
			if (selectedUserName == reactiveSelectedUserName.get()) {
				detailStatisticTab.set(hashArray[2] || 'development');
				return;
			}

			isLoading.set(true);

			Meteor.call('statistic.getUserStatistic', selectedUserName, function(err, data) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось загрузить статистику пользователя', err.error);
				} else {
					detailStatisticData.set(data);
					detailStatisticTab.set(hashArray[2] || 'development');
				}
			});
			detail = true;
		} else {
			detailStatisticTab.set(null);
			detailStatisticData.set(null);
		}
		reactiveSelectedUserName.set(selectedUserName);
	} else {
		reactiveSelectedUserName.set('');
	}

	if (pageNumber && pageNumber != lastPageNumber) {
		lastPageNumber = pageNumber;
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		isLoading.set(true);
		// show required page
		Meteor.call('statistic.getPageInRating', pageNumber, countPerPage, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var selectedUserСontain = false;

				data.users.forEach(function(user, i) {
					user.place = skip + i + 1;
					if (user.username == selectedUserName) {
						selectedUserСontain = true;
					}
				});

				if (selectedUserName && !selectedUserСontain) {
					showUser(selectedUserName, detail);
					return;
				}

				users.set(data.users);
				countTotal.set(data.count);

				Meteor.setTimeout(scrollToSelectedUser);
			}
		});
	} else if (!pageNumber) {
		showUser(selectedUserName || Meteor.user().username, detail);
	}
};

var showUser = function(userName, detail) {
	if (!userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', userName, function(err, data) {
		isLoading.set(false);
		if (err) {
			Notifications.error('Не удалось загрузить страницу', err.error);
		} else {
			var userPage = (data.total > 0 && data.position > 0
				? Math.ceil( data.position / countPerPage )
				: 1
			);

			Router.go(
				'statistics',
				{ page: userPage },
				{ hash: userName + ( detail ? '/detail' : '' ) } 
			);

			Meteor.setTimeout(scrollToSelectedUser);
		}
	});
};

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	users: function() {
		return users.get();
	},

	countTotal: function() {
		return countTotal.get();
	},

	selectedUserName: function() {
		return reactiveSelectedUserName.get();
	},

	detailStatisticTab: function() {
		return detailStatisticTab.get();
	},

	countPerPage: countPerPage,

	rank: function(rating) {
		return Game.User.getLevel(rating);
	},

	achievements: function (user) {
		var result = [];

		for (var key in user.achievements) {
			var item = Game.Achievements.items[key];
			var level = user.achievements[key].level;
			
			if (item && level > 0) {
				result.push({
					engName: item.engName,
					name: item.name(level),
					description: item.description(level),
					currentLevel: level,
					maxLevel: item.maxLevel(),
					effect: item.effect
				});
			}
		}

		return result;
	},

	mailHash: function(username) {
		return 'compose/' + username;
	}
});

var searchUser = function (e , t) {
	showUser(t.$('input[name="searchUserInRating"]').val());
};

Template.rating.events({
	'keyup input[name="searchUserInRating"]': function(e, t) {
		if (e.keyCode == 13) {
			searchUser(e, t);
		}
	},

	'click .search': searchUser,

	'click .returnToMe': function(e, t) {
		t.$('input[name="searchUserInRating"]').val('');
		showUser(Meteor.user().username);
	}
});

var scrollToSelectedUser = function() {
	var userRow = $('.selectedUser')[0];
	if (userRow) {
		$('.rating .data')[0].scrollTop = userRow.offsetTop - 150;
	}
};

Template.detailTable.helpers({
	lookup: function(obj) {
		var answer = obj;
		for(var i = 1; (i < arguments.length - 1) && (arguments[i] !== undefined); i++) {
				answer = answer && answer[arguments[i]];
		}
		return answer || 0;
	}
});

Template.detailStatistic.helpers({
	data: function() {
		return detailStatisticData.get();
	},

	activeTab: function() {
		return detailStatisticTab.get();
	},

	levelsArray: function(maxLevel) {
		var levels = [];
		for(var i = 1; i <= maxLevel; i++) {
			arr.push({
				engName: i,
				name: i
			});
		}
		return levels;
	}
});

Template.rating.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};