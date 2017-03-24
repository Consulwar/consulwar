initMutualClient = function() {

initMutualMainLib();

Meteor.subscribe('mutualResearch');

Game.Mutual.showPage = function() {
	var item = Game.Mutual.items[this.params.group][this.params.item];
	
	if (item) {
		this.render('item_mutual', {
			to: 'content', 
			data: {
				mutual: item,
				count: new ReactiveVar(1),
				subscribe: Meteor.subscribe('topInvestors', item)
			}
		});
	} else {
		this.render('empty', {to: 'content'});
	}
};

Template.item_mutual.onDestroyed(function() {
	this.data.subscribe.stop();
});

Template.item_mutual.helpers({
	count: function() {
		return this.count.get();
	}
});

Template.top_investors.helpers({
	investors: function() {
		return Game.Investments.getTopInvestors(this.mutual);
	}
});

Template.item_mutual.events({
	'click .resources .credits': function(e, t) {
		Game.Payment.showWindow();
	},

	'keyup .count, change .count': function(e, t) {
		var value = parseInt(e.target.value.replace(/\D/g,''), 10);
		value = value > 0 ? value : 1;

		e.target.value = value;

		this.count.set(value);
	},

	'click button.build': function(e, t) {
		var item = t.data.mutual;

		Meteor.call('mutual.invest', {
				group: item.group,
				engName: item.engName,
				investments: this.count.get(),
				currency: e.target.dataset.currency
			},
			function(error, message) {
				if (error) {
					Notifications.error('Невозможно сделать вложение', error.error);
				} else {
					Notifications.success('Ресурсы вложены');
				}
			}
		);
	}
});

};