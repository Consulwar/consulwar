initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticData;
var selectedUserName;
var lastPageNumber;
var users = [];
var countTotal;
var lastStatisticType;
var firstDraw = true; //при первой отрисовке редиректит на страницу с выбранным пользователем
var selectedUser;

Game.Rating = {};

Game.Rating.showPage = function() {
	if (firstDraw) {
		this.render('loading', { to: 'content' });
	}
	var countPerPage = 20;
	var user = Meteor.user(); 
	var self = this;
	var pageNumber = parseInt( this.params.page, 10 );
	var statisticType = this.params.group;
	var hash = this.getParams().hash && this.getParams().hash.split('/');
	var showDetailStatistic = false;

	if (hash && statisticType && pageNumber) {

		if (hash[0] != selectedUserName) {
			selectedUserName = hash[0];
			renderConsulInfo.call(this, selectedUserName, pageNumber, statisticType);
		}

		if (statisticType == lastStatisticType) {
			renderRating.call(this, selectedUserName, countPerPage, countTotal, users, statisticType);
		}

		if (hash[1] == 'detail') {
			var tab = hash[2];
			if (selectedUserName == selectedUserName && detailStatisticData) {
				renderDetailStatistic.call(this, selectedUserName, tab, detailStatisticData);
				return;
			}

			isLoading.set(true);

			Meteor.call('statistic.getUserStatistic', selectedUserName, function(err, data) {
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
	} else {
		this.render('empty', { to: 'detailStatistic' });
	}
	var pageChanged = (pageNumber != lastPageNumber || statisticType != lastStatisticType);
	if (pageNumber && statisticType && pageChanged && statisticType) {
		isLoading.set(true);
		// show required page
		Meteor.call('statistic.getPageInRating', statisticType, pageNumber, countPerPage, function(err, data) {
			isLoading.set(false);
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var selectedUserContain = false;
				var sortField = Game.Statistic.getSortFieldForType(statisticType);
				users = data.users;
				countTotal = data.count;

				for (var i = 0; i < users.length; i++) {
					users[i].place = skip + i + 1;
					users[i].rating = Game.Statistic.getUserValue(sortField, users[i]);
					if (users[i].username == selectedUserName) {
						selectedUserContain = true;
					}
				}

				if (selectedUserName && !selectedUserContain && (firstDraw || statisticType != lastStatisticType)) {
					showUser({
						userName: selectedUserName, 
						showDetailStatistic: showDetailStatistic, 
						statisticType: statisticType,
						lastPageNumber: lastPageNumber,
						countPerPage: countPerPage
					});
				}

				renderRating.call(self, selectedUserName, countPerPage, countTotal, users, statisticType);

				lastStatisticType = statisticType;
				lastPageNumber = pageNumber;
			}
		});
	} 

	if (!pageNumber || !statisticType) {
		showUser({
			userName: selectedUserName || user.username, 
			showDetailStatistic: showDetailStatistic, 
			statisticType: statisticType || "general",
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

var renderConsulInfo = function(userName, page, statisticType) {
	var self = this;
	firstDraw = false;
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
					statisticType: statisticType,
					ratingPage: page
				} 
			});

			renderAchievements.call(self, selectedUser, statisticType);
		}
	});
};

var renderAchievements = function(selectedUser, statisticType) {
	if (selectedUser && selectedUser) {
		this.render('achievements', { 
			to: 'achievements',
			data: {
				selectedUser: selectedUser,
				statisticType: statisticType
			}
		});
	}
};

var renderRating = function(userName, countPerPage, countTotal, users, statisticType) {
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
			statisticType: statisticType
		} 
	});

	Meteor.setTimeout(scrollToSelectedUser);

	renderAchievements.call(this, selectedUser, statisticType);
};
//userName, showDetailStatistic, statisticType, lastPageNumber
var showUser = function(options) {
	if (!options.userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	detailStatisticData = null;

	var user = _.find(users, function(user){ 
		return options.userName == user.username; 
	});

	if (user && options.statisticType == lastStatisticType && options.lastPageNumber) {
		Router.go(
			'statistics',
			{ page: options.lastPageNumber, group: options.statisticType },
			{ 
				hash: options.userName + ( options.showDetailStatistic ? '/detail' : '' ),
				replaceState: true
			}
		);
		$('input[name="searchUserInRating"]').val("");
		return;
	}

	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', options.statisticType, options.userName, function(err, data) {
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
				{ page: userPage, group: options.statisticType || 'general' },
				{
					hash: options.userName + ( options.showDetailStatistic ? '/detail' : '' ),
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
	showUser({
		userName: userName || t.$('input[name="searchUserInRating"]').val(), 
		showDetailStatistic: false, 
		statisticType: t.data.statisticType,
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

		for (var key in Game.Achievements.items) {
			var item = Game.Achievements.items[key];
			var level = user.achievements && user.achievements[key] && user.achievements[key].level;
			var maxLevel = item.maxLevel();

			var nextLevel = item.nextLevel(level || 0);
			var nextLevelDescription = item.description(nextLevel);
			var nextLevelName = item.name(nextLevel);
			
			if (item.statisticType == this.statisticType ||
				(!item.statisticType && this.statisticType == 'general') //уберу эту проверку когда добавлю группы ачивкам
			) {
				result.push({
					engName: item.engName,
					name: item.name(level),
					description: item.description(level),
					currentLevel: level,
					maxLevel: maxLevel,
					nextLevel: nextLevel,
					nextLevelDescription: nextLevelDescription,
					nextLevelName: nextLevelName,
					effect: item.effect,
					isActive: level
				});
			}
		}
		return result;
	},

	rank: function(rating) {
		return Game.User.getLevel(rating);
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