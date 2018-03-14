import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/button/button.styl';

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
      $(popup.firstNode()).find('.cw--popup__wrapper')[0],
    );
    popup.firstNode().focus();

    subtemplate.onViewDestroyed(function() {
      Game.Popup.zIndex -= 1;
      Blaze.remove(popup);
      const nextPopup = $('.popup').last()[0];
      if (nextPopup) {
        nextPopup.focus();
      }
    });
  },
};

Template.popup.events({
  'click .cw--popup__close'(event, templateInstance) {
    Blaze.remove(templateInstance.view);
  },
  'keyup'(event, templateInstance) {
    if (event.keyCode === 9) {
      templateInstance.firstNode.focus();
    }
    if (event.keyCode === 27) {
      Blaze.remove(templateInstance.view);
    }
  },
});
};
