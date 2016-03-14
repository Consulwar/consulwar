Template.pages.helpers({
	route: function() {
		return Router.current().route.getName();
	},

	current: function() {
		return parseInt( Router.current().params.page, 10 );
	},

	maxPage: function() {
		return this.total ? Math.ceil( this.total / this.perPage ) : 0;
	},

	pages: function() {
		if (!this.total) {
			this.total = 0;
		}

		var totalPages = Math.ceil( this.total / this.perPage );
		if (totalPages <= 1) {
			return null;
		}

		// calc start page
		var maxVisible = 11;
		var from = Router.current().params.page - Math.floor( maxVisible / 2 );
		if (totalPages - from < maxVisible) {
			from = totalPages - maxVisible + 1;
		}
		if (from < 1) {
			from = 1;
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
				start: (i - 1) * this.perPage + 1,
				end: (i < totalPages) ? i * this.perPage : this.total
			});
		}
		
		return {
			items: items,
			hasFirst: from == 1,
			hasLast: to == totalPages
		}
	}
});