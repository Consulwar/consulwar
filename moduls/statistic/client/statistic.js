initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticData;
var selectedUserName;
var lastPageNumber;
var users = [];
var countTotal;
var laststatisticGroup;
var selectedUser;

Game.Rating = {};

Game.Rating.showPage = function() {
	if (!selectedUser) {
		this.render('loading', { to: 'content' });
	}
	var countPerPage = Game.Statistic.COUNT_PER_PAGE;
	var user = Meteor.user(); 
	var self = this;
	var pageNumber = parseInt( this.params.page, 10 );
	var statisticGroup = this.params.group;
	var hash = this.getParams().hash && this.getParams().hash.split('/');
	var detailStatisticTab;

	if (hash && statisticGroup && pageNumber) {

		if (hash[0] != selectedUserName || statisticGroup != laststatisticGroup) {
			selectedUserName = hash[0];
			renderConsulInfo.call(this, selectedUserName, pageNumber, statisticGroup);
		}

		if (statisticGroup == laststatisticGroup) {
			renderRating.call(this, selectedUserName, countPerPage, countTotal, users, statisticGroup);
		}

		if (hash[1] == 'detail') {
			detailStatisticTab = hash[2];
			if (selectedUserName == selectedUserName && detailStatisticData) {
				renderDetailStatistic.call(this, selectedUserName, detailStatisticTab, detailStatisticData);
				return;
			}

			isLoading.set(true);

			Meteor.call('statistic.getUserStatistic', selectedUserName, function(err, data) {
				isLoading.set(false);
				if (err) {
					Notifications.error('Не удалось загрузить статистику пользователя', err.error);
				} else {
					detailStatisticData = data;
					renderDetailStatistic.call(self, selectedUserName, detailStatisticTab, detailStatisticData);
				}
			});
			detailStatisticTab = 'development';
		} else {
			this.render('empty', { to: 'detailStatistic' });
		}
	} else {
		this.render('empty', { to: 'detailStatistic' });
	}
	var pageChanged = (pageNumber != lastPageNumber || statisticGroup != laststatisticGroup);
	if (pageChanged && pageNumber && statisticGroup) {
		isLoading.set(true);
		// show required page
		Meteor.call('statistic.getPageInRating', statisticGroup, pageNumber, countPerPage, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var selectedUserContain = false;
				var sortField = Game.Statistic.getSortFieldForType(statisticGroup).field;
				users = data.users;
				countTotal = data.count;

				for (var i = 0; i < users.length; i++) {
					users[i].place = skip + i + 1;
					users[i].rating = Game.Statistic.getUserValue(sortField, users[i]);
					if (users[i].username == selectedUserName) {
						selectedUserContain = true;
					}
				}

				if (selectedUserName && !selectedUserContain && (!selectedUser || statisticGroup != laststatisticGroup)) {
					Game.Statistic.redirectToUser({
						userName: selectedUserName, 
						detailStatisticTab: detailStatisticTab, 
						statisticGroup: statisticGroup,
						lastPageNumber: lastPageNumber,
						countPerPage: countPerPage
					});
				}

				renderRating.call(self, selectedUserName, countPerPage, countTotal, users, statisticGroup);

				laststatisticGroup = statisticGroup;
				lastPageNumber = pageNumber;
			}
		});
	} 

	if (!pageNumber || !statisticGroup) {
		Game.Statistic.redirectToUser({
			userName: selectedUserName || user.username, 
			detailStatisticTab: detailStatisticTab, 
			statisticGroup: statisticGroup || "general",
			lastPageNumber: lastPageNumber,
			countPerPage: countPerPage
		});
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

var renderConsulInfo = function(userName, page, statisticGroup) {
	var self = this;
	isLoading.set(true);
	Meteor.call('statistic.getUserInfo', userName, function(err, data) {
		isLoading.set(false);
		if (err) {
			Notifications.error('Не удалось загрузить информацию о пользователе', err.error);
		} else {
			selectedUser = data;
			self.render('consulInfo', {
				to: 'consulInfo',
				data: {
					selectedUser: selectedUser,
					statisticGroup: statisticGroup,
					ratingPage: page
				} 
			});

			renderAchievements.call(self, selectedUser, statisticGroup);
		}
	});
};

var renderAchievements = function(selectedUser, statisticGroup) {
	if (selectedUser) {
		this.render('achievements', { 
			to: 'achievements',
			data: {
				selectedUser: selectedUser,
				statisticGroup: statisticGroup
			}
		});
	}
};

var renderRating = function(userName, countPerPage, countTotal, users, statisticGroup) {
	this.render('statistic', { 
		to: 'content'
	});

	this.render('rating', { 
		to: 'rating',
		data: {
			selectedUserName: userName,
			countPerPage: countPerPage,
			users: users,
			countTotal: countTotal,
			statisticGroup: statisticGroup
		} 
	});

	Meteor.setTimeout(scrollToSelectedUser);

	renderAchievements.call(this, selectedUser, statisticGroup);
};

Game.Statistic.userHash = function (userName, detailStatisticTab) {
	return userName + ( detailStatisticTab 
		? "/detail/" + detailStatisticTab 
		: ""
	);
};

Game.Statistic.redirectToUser = function(options) {
	if (!options.userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	detailStatisticData = null;

	var user = _.find(users, function(user){ 
		return options.userName == user.username; 
	});

	if (user && options.statisticGroup == laststatisticGroup && options.lastPageNumber) {
		Router.go(
			'statistics',
			{ page: options.lastPageNumber, group: options.statisticGroup },
			{ 
				hash: Game.Statistic.userHash(options.userName, options.detailStatisticTab),
				replaceState: true
			}
		);
		$('input[name="searchUserInRating"]').val("");
		return;
	}

	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', options.statisticGroup, options.userName, function(err, data) {
		isLoading.set(false);
		if (err) {
			Notifications.error('Не удалось загрузить страницу', err.error);
		} else {
			var userPage = (data.total > 0 && data.position > 0
				? Math.ceil( data.position / options.countPerPage )
				: 1
			);

			Router.go(
				'statistics',
				{ page: userPage, group: options.statisticGroup || 'general' },
				{
					hash: Game.Statistic.userHash(options.userName, options.detailStatisticTab),
					replaceState: true
				} 
			);
			$('input[name="searchUserInRating"]').val("");
		}
	});
};

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	}
});

var searchUser = function (e , t, userName) {
	Game.Statistic.redirectToUser({
		userName: userName || t.$('input[name="searchUserInRating"]').val(),
		statisticGroup: t.data.statisticGroup,
		lastPageNumber: lastPageNumber,
		countPerPage: t.data.countPerPage
	});
};

Template.rating.events({
	'keyup input[name="searchUserInRating"]': function(e, t) {
		if (e.keyCode == 13) {
			searchUser(e, t);
		}
	},

	'click .search': searchUser,

	'click .data tr': function(e, t) {
		searchUser(e, t, e.currentTarget.dataset.username);
	},

	'click .returnToMe': function(e, t) {
		t.$('input[name="searchUserInRating"]').val('');
		searchUser(e, t, Meteor.user().username);
	}
});

Template.achievements.helpers({
	achievements: function (user) {
		var result = [];

		for (var key in Game.Achievements.items[this.statisticGroup]) {
			var item = Game.Achievements.items[this.statisticGroup][key];
			var level = item.currentLevel(user.achievements || null);
			var nextLevel = item.nextLevel(user.achievements || null);
			
			if (item.group == this.statisticGroup) {
				result.push({
					notImplemented: item.notImplemented,
					engName: item.engName,
					name: item.name(level),
					description: item.description(level),
					currentLevel: level,
					maxLevel: item.maxLevel(),
					nextLevel: nextLevel,
					nextLevelDescription: item.description(nextLevel),
					nextLevelName: item.name(nextLevel),
					effect: item.effect
				});
			}
		}
		return result;
	},

	rank: function(rating) {
		return Game.User.getLevel(rating);
	},

	tooltip: function(achievement) {
		return {
			'data-tooltip': Blaze.toHTMLWithData(Template.achievementTooltip, {
				achievement: achievement
			})
		};
	}
});

Template.consulInfo.helpers({
	userActive: function(user) {
		var lastLoginDate = new Date(user.status.lastLogin.date);
		return (Game.getCurrentTime() - lastLoginDate / 1000 ) / (60 * 60 * 24) < 3;
	}
});

var scrollToSelectedUser = function() {
	var userRow = $('.selectedUser')[0];
	var rating = $('.rating .data');
	if(!userRow) {
		rating.scrollTop(0);
	} else if ( 
		userRow.offsetTop < rating.scrollTop() - 10 ||
		userRow.offsetTop > (rating.scrollTop() + rating.height() - 10)
	) {
		rating.scrollTop(userRow.offsetTop - 150);
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

Template.statistic.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};