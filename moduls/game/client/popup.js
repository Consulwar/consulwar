initPopupClient = function() {

Game.Popup = {
	zIndex: 100,

	show: function(templateName, data) {
		this.zIndex++;

		var popup = Blaze.renderWithData(Template.popup, {
			zIndex: this.zIndex
		}, $('.over')[0]);

		var subtemplate = Blaze.renderWithData(
			Template[templateName],
			data,
			$(popup.firstNode())[0]
		);

		subtemplate.onViewDestroyed(function() {
			Game.Popup.zIndex--;
			Blaze.remove(popup);
		});

		$(subtemplate.firstNode())
			.parent()
			.find('>*:first-child')
			.append('<button class="close"></button>');
	}
};

Template.popup.events({
	'click .close': function(e, t) {
		Blaze.remove(t.view);
	}
});

};