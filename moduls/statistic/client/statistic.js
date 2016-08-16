initStatisticClient = function() {

initStatisticLib();

Meteor.subscribe('statistic');

var isLoading = new ReactiveVar(false);
var detailStatisticView = new ReactiveVar(false);
var detailStatisticTexts = new ReactiveVar([]);
var users = new ReactiveVar();
var reactiveCountTotal = new ReactiveVar(false);
var reactiveSelectedUserName = new ReactiveVar(false);
var lastPageNumber;


var countPerPage = 20;

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var hash = this.getParams().hash;
	var selectedUserName;
	var detail = false;

	this.render('rating', { to: 'content' });

	if (hash) {
		var hashArray = hash.split("/");
		selectedUserName = hashArray[0];
		reactiveSelectedUserName.set(selectedUserName);
		if (hashArray[1] == "detail") {
			showUserDetailStatistic(selectedUserName);
			detail = true;
		}
	} else {
		reactiveSelectedUserName.set("");
	}

	isLoading.set(true);

	if (pageNumber && pageNumber != lastPageNumber) {
		lastPageNumber = pageNumber;
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
				var selectedUserСontain = false;

				for (var i = 0; i < data.users.length; i++) {
					data.users[i].place = skip + i + 1;
					if (data.users[i].username == selectedUserName) {
						selectedUserСontain = true;
					}
				}
				users.set(data.users);

				if (selectedUserName && !selectedUserСontain) {
					showUser(selectedUserName, detail);
					return;
				}
				reactiveCountTotal.set(data.count);

				Meteor.setTimeout(scrollToSelectedUser);
			}

			isLoading.set(false);
		});
	} else {
		showUser(selectedUserName || Meteor.user().username, detail);
	}
};

var showUser = function(userName, detail) {
	if (!userName){
		return Notifications.error('Введите имя пользователя');
	}
	
	isLoading.set(true);

	Meteor.call('statistic.getUserPositionInRating', userName, function(err, data) {
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
				{ hash: userName + ( detail ? "/detail" : "" ) } 
			);
		}

		isLoading.set(false);
	});
};

var showUserDetailStatistic = function(userName) {
	isLoading.set(true);

	Meteor.call('statistic.getUserStatistic', userName, function(err, data) {
		if (err) {
			Notifications.error('Не удалось загрузить статистику пользователя', err.error);
		} else {
			console.log(data);
			try {
				detailStatisticTexts.set([
					"Зданий построено: " + data.building.total
				]);
			} catch (e) {
				detailStatisticTexts.set([
					"Зданий построено: " + 0
				]);
			}
			detailStatisticView.set(true);
		}
	});
}

Template.rating.helpers({
	isLoading: function() {
		return isLoading.get();
	},

	users: function() {
		return users.get();
	},

	countTotal: function() {
		return reactiveCountTotal.get();
	},

	selectedUserName: function() {
		return reactiveSelectedUserName.get();
	},

	detailStatisticView: function() {
		return detailStatisticView.get();
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
	},

	'click .tab': function(e, t) {
		t.$('.tab').removeClass('active');
		$(e.currentTarget).addClass('active');
		t.$('.page').hide();
		t.$('.' + $(e.currentTarget).data("name")).show();
	}
});

var scrollToSelectedUser = function() {
	var userRow = $('.selectedUser')[0];
	if (userRow) {
		$('.rating .data')[0].scrollTop = userRow.offsetTop - 150;
	}
};

var hideUserDetailStatistic = function() {
	detailStatisticView.set(false);
	Router.go(
		'statistics',
		{ page: Router.current().params.page },
		{ hash: Router.current().params.hash.match(/.+(?=\/)/) }
	);
};

Template.detailStatistic.helpers({
	developmentTexts: function () {
		return detailStatisticTexts.get();
	}
});

Template.detailStatistic.events({
	'click .close': function(e, t) {
		hideUserDetailStatistic();
	}
});

Template.rating.onRendered(scrollToSelectedUser);

initStatisticAchievementsClient();

};