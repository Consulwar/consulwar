Battle = new Meteor.Collection("battle");

Meteor.subscribe('fights');

Session.set('currentBattleLevel', 1);

Template.battle.helpers({
	units: function() {
		return _.map(game.army.fleet, function(val, key) {
			return {
				engName: key,
				count: game.army.fleet[key].currentLevel()
			}
		})
	},

	battleLevels: function() {
		return _.map(Session.get('active_item').level, function(value, key) {
			return {
				level: key
			};
		});
	},

	battleLevel: function() {
		var level = Session.get('active_item').level[Session.get('currentBattleLevel')];
		return {
			enemies: _.map(level.enemies, function(value, key) {
				return {
					name: game.reptiles.rfleet[key].name,
					engName: key,
					count: _.isString(value) ? game.Battle.count[value] : value
				}	
			})
		}
	},

	selectedLevel: function() {
		return Session.get('active_item').level[Session.get('currentBattleLevel')]
	}
});

Template.battle.events({
	'change select': function(e, t) {
		Session.set('currentBattleLevel', e.currentTarget.value);
	},

	'click .items li': function(e, t) {
		if (!$(e.currentTarget).hasClass('disabled')) {
			$(e.currentTarget).toggleClass('active');
		}
	},

	'click .send_fleet': function(e, t) {
		var active = $('.fleet .active div');
		var units = [];
		for (var i = 0; i < active.length; i++) {
			var name = active[i].className;
			
			$(active[i]).parent().removeClass('active');

			units.push(name);
		}

		if (units.length) {
			Meteor.call('sendFleet', Session.get('active_item').engName, parseInt($('select.battle_level').val()), units, function(err, result) {
				if (err) {
					Notifications.error('Невозможно отправить флот', err.error);
				} else {
					Notifications.success('Флот отправлен', 'ожидайте боя');
				}
			});
		} else {
			Notifications.info('Выберите корабли для отправки');
		}
	}
});
/*
Template.reserve.events({

	'click .select_all': function() {
		$('.items li:not(.disabled,.active)').click();
	},

	'click .send_reinforcement': function() {
		var active = $('.reserve .active div');
		var units = [];
		for (var i = 0; i < active.length; i++) {
			var name = active[i].className;
			
			units.push(name);
		}

		$('.reserve .active').removeClass('active');
		Session.set('SendToReserve', 0);

		Meteor.call('sendReinforcement', units, function(err, result) {
			Notifications.info('Получено ' + result + ' чести', 'Замечательно!');
			Session.set('honor', 0);
		});
	}
})*/