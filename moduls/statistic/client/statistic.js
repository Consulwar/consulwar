initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(true);
var detailStatisticData;
var selectedUserName;
var lastPageNumber;
var countPerPage = 20;
var users = [];
var countTotal;
var lastStatisticType;
var statisticType;
var firstDraw = true; //при первой отрисовке редиректит на страницу с выбранным пользователем
var selectedUser;

Game.Rating = {};

Game.Rating.showPage = function() {
	if (firstDraw) {
		this.render('loading', { to: 'content' });
	}
	var user = Meteor.user(); 
	var self = this;
	var pageNumber = parseInt( this.params.page, 10 );
	statisticType = this.params.group;
	var hash = this.getParams().hash && this.getParams().hash.split('/');
	var newSelectedUserName;
	var showDetailStatistic = false;

	if (!statisticType) {
		showUser(selectedUserName || user.username, showDetailStatistic, "general", lastPageNumber);
		return;
	}

	if (hash) {
		newSelectedUserName = hash[0];

		if (newSelectedUserName != selectedUserName) {
			renderConsulInfo.call(this, newSelectedUserName, pageNumber);
		}

		if (statisticType == lastStatisticType) {
			renderRating.call(this, newSelectedUserName, countPerPage, countTotal, users, statisticType);
		}

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
		showUser(user.username, showDetailStatistic, statisticType || "general", lastPageNumber); //убрать ||
		this.render('empty', { to: 'detailStatistic' });
		return;
	}
	var pageChanged = (pageNumber != lastPageNumber || statisticType != lastStatisticType);
	if (pageNumber && statisticType && pageChanged) {
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
					showUser(selectedUserName, showDetailStatistic, statisticType, lastPageNumber);
				}

				renderRating.call(self, selectedUserName, countPerPage, countTotal, users, statisticType);

				lastStatisticType = statisticType;
				lastPageNumber = pageNumber;
			}
		});
	} else if (!pageNumber) {
		showUser(selectedUserName || user.username, showDetailStatistic, statisticType, lastPageNumber);
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

var renderConsulInfo = function(userName, page) {
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

			self.render('achievements', { 
				to: 'achievements',
				data: {
					selectedUser: selectedUser,
					statisticType: statisticType
				} 
			});
		}
	});
};

var renderRating = function(userName, countPerPage, countTotal, users, statisticType) {
	this.render('statistic', { 
		to: 'content',
		data: {
			selectedUserName: userName,
			statisticType: statisticType
		} 
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
	if (selectedUser && selectedUser.achievements) {
		this.render('achievements', { 
			to: 'achievements',
			data: {
				selectedUser: selectedUser,
				statisticType: statisticType
			}
		});
	}
};

var showUser = function(userName, showDetailStatistic, statisticType, lastPageNumber) {
	if (!userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	detailStatisticData = null;

	var user = _.find(users, function(user){ 
		return userName == user.username; 
	});

	if (user && statisticType == lastStatisticType) {
		Router.go(
			'statistics',
			{ page: lastPageNumber, group: statisticType },
			{ hash: userName + ( showDetailStatistic ? '/detail' : '' ), replaceState: true } 
		);
		$('input[name="searchUserInRating"]').val("");
		return;
	}

	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', statisticType, userName, function(err, data) {
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
				{ page: userPage, group: statisticType || 'general' },
				{ hash: userName + ( showDetailStatistic ? '/detail' : '' ), replaceState: true } 
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

Template.achievements.helpers({
	achievements: function (user) {
		var result = [];

		console.log(user.achievements);

		for (var key in Game.Achievements.items) {
			var item = Game.Achievements.items[key];
			var level = user.achievements[key] && user.achievements[key].level;
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

var searchUser = function (e , t) {
	showUser(t.$('input[name="searchUserInRating"]').val(), false, statisticType, lastPageNumber);
};

Template.statistic.events({
	'keyup input[name="searchUserInRating"]': function(e, t) {
		if (e.keyCode == 13) {
			searchUser(e, t);
		}
	},

	'click .search': searchUser,

	'click .rating .data tr': function(e, t) {
		showUser(e.currentTarget.dataset.username, false, statisticType, lastPageNumber);
	},

	'click .returnToMe': function(e, t) {
		t.$('input[name="searchUserInRating"]').val('');
		showUser(Meteor.user().username, false, statisticType, lastPageNumber);
	}
});

var scrollToSelectedUser = function() {
	var userRow = $('.selectedUser')[0];
	var rating = $('.rating .data');
	if(!userRow) {
		rating.scrollTop(0);
	} else if ( 
		userRow.offsetTop < rating.scrollTop() - 10 ||
		userRow.offsetTop > (rating.scrollTop() + 320)
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