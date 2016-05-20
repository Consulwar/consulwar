initRatingClient = function() {

Game.Rating = {};

Game.Rating.showPage = function() {
	var pageNumber = parseInt( this.params.page, 10 );
	var countPerPage = 20;

	if (pageNumber) {
		// reset scroll
		var element = $('.rating .data')[0];
		if (element) {
			element.scrollTop = 0;
		}
		// show required page
		Meteor.call('rating.getPage', pageNumber, countPerPage, function(err, data) {
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var skip = (pageNumber - 1) * countPerPage;
				var users = data.users;
				
				for (var i = 0; i < users.length; i++) {
					users[i].place = skip + i + 1;
				}

				Router.current().render('rating', {
					to: 'content',
					data: {
						countPerPage: countPerPage,
						countTotal: data.count,
						users: users
					}
				});
			}
		});
	} else {
		// redirect to user page
		Meteor.call('rating.getUserPosition', function(err, data) {
			if (err) {
				Notifications.error('Не удалось загрузить страницу', err.error);
			} else {
				var userPage = (data.total > 0 && data.position > 0)
					? Math.ceil( data.position / countPerPage )
					: 1;

				Router.go('statistics', { page: userPage } );
			}
		});
	}
};

Template.rating.helpers({
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

Template.rating.onRendered(function() {
	var userRow = $('#' + Meteor.user().username)[0];
	if (userRow) {
		$('.rating .data')[0].scrollTop = userRow.offsetTop + 200;
	}
});

};