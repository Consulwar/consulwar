Template.pages.helpers({
	current: function() {
		return parseInt( Template.instance().data.current, 10 );
	},

	maxPage: function() {
		return Math.ceil( Template.instance().data.total / Template.instance().data.onPage );
	},

	route: function() {
		return Template.instance().data.route;
	},

	items: function() {
		var items = [];

		var totalPages = Math.ceil( this.total / this.onPage );
		var maxVisiblePages = 11;

		// calc start page
		var half = Math.floor(maxVisiblePages / 2);
		var from = this.current - half;

		if (from < 1) {
			from = 1;
		} else if (totalPages - from < maxVisiblePages) {
			from = totalPages - maxVisiblePages + 1;
		}

		// calc end page
		var to = from + maxVisiblePages - 1;
		if (to > totalPages) {
			to = totalPages;
		}

		// prepare pages array
		for (var i = from; i <= to; i++) {
			items.push({
				page: i,
				start: (i - 1) * this.onPage + 1,
				end: (i < totalPages) ? i * this.onPage : this.total
			});
		}

		return items;
	}
});