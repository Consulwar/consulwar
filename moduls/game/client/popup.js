import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';

initPopupClient = function() {
Game.Popup = {
  zIndex: 100,

  show({
    templateName,
    data,
    template = Template[templateName],
  }) {
    this.zIndex += 1;

    const popup = Blaze.renderWithData(Template.popup, {
      zIndex: this.zIndex,
    }, $('.over')[0]);

    const subtemplate = Blaze.renderWithData(
      template,
      data,
      $(popup.firstNode())[0],
    );

    subtemplate.onViewDestroyed(function() {
      Game.Popup.zIndex -= 1;
      Blaze.remove(popup);
    });

    $(subtemplate.firstNode())
      .parent()
      .find('>*:first-child')
      .append('<button class="close"></button>');
  },
};

Template.popup.events({
  'click .close'(event, templateInstance) {
    Blaze.remove(templateInstance.view);
  },
});
};
