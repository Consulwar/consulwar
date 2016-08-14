initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(false);
var isLoading = new ReactiveVar(false);
var detailStatisticView = new ReactiveVar(false);

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var hash = Router.current().getParams().hash;
	var selectedUserName;
	var detail = false;
	var countPerPage = 20;

	if (hash) {
		var hashArray = hash.split("/");
		selectedUserName = hashArray[0];
		if (hashArray[1] == "detail") {
			Game.Statistic.showDetailStatistic(selectedUserName);
			detail = true;
		}
	}
	isLoading.set(true);

	if (pageNumber) {
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		// show required page
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
					showUser(selectedUserName, detail);
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
		showUser(selectedUserName || Meteor.user().username, detail);
	}
};

var showUser = function(selectedUserName, detail) {
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
				{ hash: selectedUserName + ( detail ? "/detail" : "" ) } 
			);
		}

		isLoading.set(false);
	});
};

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	detailStatisticView: function() {
		return detailStatisticView.get();
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
	},

	detailStatisticRoute: function (userName) {
		return Router.path(
			'statistics',
			{ page: Router.current().params.page },
			{ hash: userName + "/detail" }
		);
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

var texts = [];

Game.Statistic.showDetailStatistic = function(userName){
	isLoading.set(true);

	Meteor.call('statistic.getUserStatistic', userName, function(err, data) {
		if (err) {
			Notifications.error('Не удалось загрузить статистику пользователя', err.error);
		} else {
			console.log(data);
			texts[0] = data.user_id;
			detailStatisticView.set(true);
		}
	});
};

Game.Statistic.hideDetailStatistic = function(){
	detailStatisticView.set(false);
	Router.go(
		'statistics',
		{ page: Router.current().params.page },
		{ hash: Router.current().params.hash.match(/.+(?=\/)/) }
	);
};

Template.detailStatistic.helpers({
	developmentTexts: function () {
		return texts;
	}
});

Template.detailStatistic.events({
	'click .close': function(e, t) {
		Game.Statistic.hideDetailStatistic();
	}
});

Template.rating.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};