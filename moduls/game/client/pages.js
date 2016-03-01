Template.pages.helpers({
	current: function() {
		return parseInt( Template.instance().data.current, 10 );
	},

	route: function() {
		return Template.instance().data.route;
	},

	items: function() {
		var max = Math.ceil( this.total / this.onPage );

		var items = [];

		for (var i = 1; i <= max; i++) {
			items.push({
				page: i,
				start: (i - 1) * this.onPage + 1,
				end: (i < max) ? i * this.onPage : this.total
			})
		}

		return items;
	}
});