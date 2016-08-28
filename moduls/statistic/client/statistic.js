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
var lastStatisticType;
var statisticType;


Game.Rating = {};

Game.Rating.showPage = function() {
	var self = this;
	var pageNumber = parseInt( this.params.page, 10 );
	statisticType = this.params.type;
	var hash = this.getParams().hash && this.getParams().hash.split('/');
	var newSelectedUserName;
	var showDetailStatistic = false;

	if (hash) {
		newSelectedUserName = hash[0];

		renderRating.call(this);

		if (hash[1] == 'detail') {
			var tab = hash[2];
			if (selectedUserName == newSelectedUserName && detailStatisticData) {
				renderDetailStatistic.call(this, selectedUserName, tab, detailStatisticData);
				return;
			}

			isLoading.set(true);

			Meteor.call('statistic.getUserStatistic', newSelectedUserName, function(err, data) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось загрузить статистику пользователя', err.error);
				} else {
					detailStatisticData = data;
					renderDetailStatistic.call(self, selectedUserName, tab, detailStatisticData);
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
	var pageChanged = (pageNumber != lastPageNumber || statisticType != lastStatisticType);
	if (pageNumber && statisticType && pageChanged) {
		lastStatisticType = statisticType;
		lastPageNumber = pageNumber;
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		isLoading.set(true);
		// show required page
		Meteor.call('statistic.getPageInRating', statisticType, pageNumber, countPerPage, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var selectedUserContain = false;

				users = data.users;
				countTotal = data.count;
				var sortField = Game.Statistic.getSortFieldForType(statisticType);

				for (var i = 0; i < users.length; i++) {
					users[i].place = skip + i + 1;
					users[i].rating = Game.Statistic.getUserValue(sortField, users[i]);
					if (users[i].username == selectedUserName) {
						selectedUserContain = true;
					}
				}

				if (selectedUserName && !selectedUserContain) {
					showUser(selectedUserName, showDetailStatistic);
					return;
				}

				renderRating.call(self);

				Meteor.setTimeout(scrollToSelectedUser);
			}
		});
	} else if (!pageNumber) {
		showUser(selectedUserName || Meteor.user().username, showDetailStatistic);
	}
};

var renderDetailStatistic = function(userName, activeTab, detailStatisticData){
	this.render('detailStatistic', {
		to: 'detailStatistic',
		data: {
			userName: userName,
			activeTab: activeTab
		}
	});
	this.render( activeTab + 'DetailStatisticPage', {
		to: 'detailStatisticPage',
		data: {
			data: detailStatisticData
		}
	});
};

var renderRating = function(){
	this.render('rating', { 
		to: 'content',
		data: {
			selectedUserName: selectedUserName,
			countPerPage: countPerPage,
			users: users,
			countTotal: countTotal,
			statisticType: statisticType
		} 
	});
};

var showUser = function(userName, showDetailStatistic) {
	if (!userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	isLoading.set(true);
	
	detailStatisticData = null;

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
				{ page: userPage, type: statisticType || 'general' },
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

Template.battleDetailStatisticPage.helpers({
	numberedFirstColumn: function(maxNum) {
		var column = [];
		for(var i = 1; i <= maxNum; i++) {
			column.push({
				engName: i,
				name: i
			});
		}
		return column;
	}
});

Template.rating.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};