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

	pages: function() {
		var totalPages = Math.ceil( this.total / this.onPage );
		if (totalPages <= 1) {
			return null;
		}

		// calc start page
		var maxVisible = 11;
		var from = this.current - Math.floor( maxVisible / 2 );
		if (from < 1) {
			from = 1;
		} else if (totalPages - from < maxVisible) {
			from = totalPages - maxVisible + 1;
		}

		// calc end page
		var to = from + maxVisible - 1;
		if (to > totalPages) {
			to = totalPages;
		}

		// prepare pages array
		var items = [];
		for (var i = from; i <= to; i++) {
			items.push({
				page: i,
				start: (i - 1) * this.onPage + 1,
				end: (i < totalPages) ? i * this.onPage : this.total
			});
		}
		
		return {
			items: items,
			hasFirst: from == 1,
			hasLast: to == totalPages
		}
	}
});