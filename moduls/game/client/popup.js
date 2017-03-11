initPopupClient = function() {

Game.Popup = {
	zIndex: 100,

	show: function(templateName, data) {
		this.zIndex++;

		var popup = Blaze.renderWithData(Template.popup, {
			zIndex: this.zIndex
		}, document.body);

		var subtemplate = Blaze.renderWithData(
			Template[templateName],
			data,
			$(popup.firstNode())[0]
		);

		subtemplate.onViewDestroyed(function() {
			Blaze.remove(popup);
		});

		$(subtemplate.firstNode())
			.parent()
			.find('>*:first-child')
			.append('<button class="close"></button>');

		return subtemplate;
	}
};

Template.popup.events({
	'click .close': function(e, t) {
		Game.Popup.zIndex--;
		Blaze.remove(t.view);
	}
});

};