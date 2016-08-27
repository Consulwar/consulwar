initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticData;
var selectedUserName;
var lastPageNumber;
var countPerPage = 20;
var users;
var countTotal;


Game.Rating = {};

Game.Rating.showPage = function() {
	var self = this;
	var pageNumber = parseInt( this.params.page, 10 );
	var hash = this.getParams().hash && this.getParams().hash.split('/');
	var newSelectedUserName;
	var showDetailStatistic = false;

	if (hash) {
		newSelectedUserName = hash[0];
		if (hash[1] == 'detail') {
			var tab = hash[2];
			if (selectedUserName == newSelectedUserName) {
				renderDetailStatistic(this, selectedUserName, tab, detailStatisticData);
				return;
			}

			isLoading.set(true);

			Meteor.call('statistic.getUserStatistic', newSelectedUserName, function(err, data) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось загрузить статистику пользователя', err.error);
				} else {
					detailStatisticData = data;
					renderDetailStatistic(self, selectedUserName, tab, detailStatisticData);
				}
			});
			showDetailStatistic = true;
		} else {
			this.render('empty', { to: 'detailStatistic' });
		}
		selectedUserName = newSelectedUserName;
	} else {
		selectedUserName = null;
		this.render('empty', { to: 'detailStatistic' });
	}

	this.render('rating', { 
		to: 'content',
		data: {
			selectedUserName: selectedUserName,
			countPerPage: countPerPage,
			users: users,
			countTotal: countTotal
		} 
	});

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
					showUser(selectedUserName, showDetailStatistic);
					return;
				}

				users = data.users;
				countTotal = data.count;

				self.render('rating', { 
					to: 'content',
					data: {
						selectedUserName: selectedUserName,
						countPerPage: countPerPage,
						users: users,
						countTotal: countTotal
					} 
				});

				Meteor.setTimeout(scrollToSelectedUser);
			}
		});
	} else if (!pageNumber) {
		showUser(selectedUserName || Meteor.user().username, showDetailStatistic);
	}
};

var renderDetailStatistic = function(self, userName, activeTab, detailStatisticData){
	self.render('detailStatistic', {
		to: 'detailStatistic',
		data: {
			userName: userName,
			activeTab: activeTab
		}
	});
	self.render( activeTab + 'Page', {
		to: 'detailStatisticPage',
		data: {
			data: detailStatisticData
		}
	});
};

var showUser = function(userName, showDetailStatistic) {
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
				{ hash: userName + ( showDetailStatistic ? '/detail' : '' ) } 
			);

			Meteor.setTimeout(scrollToSelectedUser);
		}
	});
};

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	},

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

Template.warPage.helpers({
	levels: function(maxLevel) {
		var levels = [];
		for(var i = 1; i <= maxLevel; i++) {
			levels.push({
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