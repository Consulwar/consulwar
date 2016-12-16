initItemClient = function() {

Meteor.subscribe('iconsUser');
Meteor.subscribe('iconsUnique');

var iconsWindowView = null;
var iconsWindowTab = new ReactiveVar(null);

Game.Icons.showSelectWindow = function(selectAction, isSelectedCondition) {
	if (!iconsWindowView) {
		iconsWindowView = Blaze.renderWithData(Template.icons, {
			selectAction,
			isSelectedCondition
		}, $('.over')[0]);
	}
};


Game.Chat.showIconsWindow = function() {
	Game.Icons.showSelectWindow(function(group, id) {
		var message = 'Сменить иконку';

		Game.showAcceptWindow(message, function() {
			Meteor.call('chat.selectIcon', group, id, function(err, result) {
				if (err) {
					Notifications.error('Не удалось выбрать иконку', err.error);
				} else {
					Notifications.success('Вы поменяли иконку');
				}
			});
		});
	}, function(group, id) {
		var user = Meteor.user();
		if (user.settings
			&& user.settings.chat
			&& user.settings.chat.icon == group + '/' + id
		) {
			return true;
		}
		return false;
	});
};

Template.icons.onRendered(function() {
	iconsWindowTab.set('items');
	this.$('.tabItems').addClass('active');
	this.$('.tabShop').removeClass('active');
});

Template.icons.helpers({
	currentTab: function() { return iconsWindowTab.get(); },

	iconGroups: function() {
		var currentTab = iconsWindowTab.get();
		var result = [];

		for (var key in Game.Icons.items) {
			if (currentTab == 'shop' && Game.Icons.items[key].isDefault) {
				continue;
			}

			var group = {
				engName: Game.Icons.items[key].engName,
				name: Game.Icons.items[key].name
			};

			var icons = [];
			for (var iconKey in Game.Icons.items[key].icons) {
				var icon = Game.Icons.items[key].icons[iconKey];
				if (currentTab == 'shop' || icon.checkHas()) {
					icons.push(icon);
				}
			}

			if (icons.length > 0) {
				group.items = icons;
			}

			result.push(group);
		}

		return result;
	},

	isSelectedCondition: function(group, id) {
		return Template.instance().data.isSelectedCondition(group, id);
	}
});

Template.icons.events({
	'click .close': function(e, t) {
		if (iconsWindowView) {
			Blaze.remove(iconsWindowView);
			iconsWindowView = null;
		}
	},

	'click .tabItems': function(e, t) {
		iconsWindowTab.set('items');
		t.$('.tabItems').addClass('active');
		t.$('.tabShop').removeClass('active');
	},

	'click .tabShop': function(e, t) {
		iconsWindowTab.set('shop');
		t.$('.tabItems').removeClass('active');
		t.$('.tabShop').addClass('active');
	},

	'click .buy': function(e, t) {
		var group = e.currentTarget.dataset.group;
		var id = e.currentTarget.dataset.id;

		var icon = Game.Icons.getIcon(group, id);
		if (!icon || !icon.canBuy()) {
			Notifications.error('Вы не можете купить эту иконку');
			return;
		}

		if (!icon.meetRequirements()) {
			return Notifications.Error('Вы не удовлетворяете требованиям иконки');
		}

		var message = 'Купить иконку за ' + icon.price.credits + ' ГГК';

		Game.showAcceptWindow(message, function() {
			Meteor.call('icon.buy', group, id, function(err, result) {
				if (err) {
					Notifications.error('Не удалось купить иконку', err.error);
				} else {
					Notifications.success('Вы купили иконку');
				}
			});
		});
	},

	'click .select': function(e, t) {
		var group = e.currentTarget.dataset.group;
		var id = e.currentTarget.dataset.id;

		var icon = Game.Icons.getIcon(group, id);
		if (!icon || !icon.checkHas()) {
			return Notifications.error('Вы не можете выбрать эту иконку');
		}

		if (!icon.meetRequirements()) {
			return Notifications.Error('Вы не удовлетворяете требованиям иконки');
		}

		t.data.selectAction(group, id);
	}
});

};