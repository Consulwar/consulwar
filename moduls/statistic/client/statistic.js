initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(false);

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var selectedUserName = Router.current().getParams().hash;
	var countPerPage = 20;

	isLoading.set(true);

	if (pageNumber) {
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		// show required page
		//this.render('loading', {layout: 'loading_layout'});
		Meteor.call('statistic.getPageInRating', pageNumber, countPerPage, function(err, data) {
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var users = data.users;
				var selectedUserСontain = false;

				for (var i = 0; i < users.length; i++) {
					users[i].place = skip + i + 1;
					if (users[i].username == selectedUserName) {
						selectedUserСontain = true;
					}
				}

				if (selectedUserName && !selectedUserСontain) {
					showUser(selectedUserName);
					return;
				}

				Router.current().render('rating', {
					to: 'content',
					data: {
						countPerPage: countPerPage,
						countTotal: data.count,
						users: users,
						selectedUserName: selectedUserName
					}
				});

				Meteor.setTimeout(scrollToSelectedUser);
			}

			isLoading.set(false);
		});
	} else {
		showUser(selectedUserName || Meteor.user().username);
	}
};

var showUser = function(selectedUserName) {
	if (!selectedUserName){
		return Notifications.error('Введите имя пользователя');
	}

	var countPerPage = 20;
	
	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', selectedUserName, function(err, data) {
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
				{ hash: selectedUserName } 
			);
		}

		isLoading.set(false);
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

Template.rating.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};