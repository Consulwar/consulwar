initUnitClient = function() {

initUnitLib();

Meteor.subscribe('units');

Game.Unit.showPage = function() {
	var item = Game.Unit.items[this.group][this.params.group][this.params.item];
	
	if (item) {
		this.render('unit', {
			to: 'content', 
			data: {
				unit: item,
				count: new ReactiveVar(1)
			}
		});
	} else {
		this.render('empty', {to: 'content'});
	}
};

Template.unit.helpers({
	count: function() {
		return this.count.get();
	}
});

Template.unit.events({
	'keyup .count, change .count, input .count': function(e, t) {
		var value = parseInt(e.target.value.replace(/\D/g,''), 10);
		value = value > 0 ? value : 1;
		e.target.value = value;
		this.count.set(value);
	},

	'click button.build': function(e, t) {
		var item = t.data.unit;

		Meteor.call('unit.build', {
				group: item.group,
				engName: item.engName,
				count: this.count.get()
			},
			function(error, message) {
				if (error) {
					Notifications.error('Невозможно подготовить юнитов', error.error);
				} else {
					Notifications.success('Строительство юнитов запущено');
				}
			}
		);
	}
});

};