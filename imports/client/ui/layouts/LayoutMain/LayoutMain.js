import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { ChdFeedbackWidget } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import UserWelcome from '/imports/client/ui/blocks/User/Welcome/UserWelcome';
import License from '/imports/client/ui/blocks/License/License';
import SoundManager from '/imports/client/ui/SoundManager/SoundManager';
import '/imports/client/ui/SoundManager/Mute/SoundManagerMute';
import '/imports/client/ui/button/button.styl';
import './LayoutMain.html';
import './LayoutMain.styl';

class LayoutMain extends BlazeComponent {
  template() {
    return 'LayoutMain';
  }

  onCreated() {
    super.onCreated();

    this.registered = new ReactiveVar('…');
    this.online = new ReactiveVar('…');

    Meteor.call('totalUsersCount', (err, count) => this.registered.set(count));
    Meteor.call('onlineUsersCount', (err, count) => this.online.set(count));
  }

  onRendered() {
    super.onRendered();

    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"/>');
    SoundManager.welcome();

    $(document).on('scroll', () => {
      if (
        $(document).scrollTop() > 400
        && !$('.cw--MainHeader').hasClass('cw--MainHeader_fly')
      ) {
        const mainHeaderSize = $('.cw--MainHeader').outerHeight();
        $('.cw--LayoutMain').css('padding-top', `${mainHeaderSize}px`);
        $('.cw--MainHeader').addClass('cw--MainHeader_fly');
      } else if ($(document).scrollTop() <= 400) {
        $('.cw--LayoutMain').css('padding-top', 0);
        $('.cw--MainHeader').removeClass('cw--MainHeader_fly');
      }
    });
  }

  showWelcomePopup() {
    Game.Popup.show({
      template: UserWelcome.renderComponent(),
      isMain: true,
    });
  }

  showLicense() {
    Game.Popup.show({
      template: License.renderComponent(),
    });
  }

  showFeedback(event, theme) {
    ChdFeedbackWidget.show(theme);
  }

  scrollTo(event, target) {
    const headerSize = $('.cw--MainHeader').outerHeight();
    $('html, body').animate({
      scrollTop: ($(target).offset().top - headerSize),
    }, 1000);
  }
}

LayoutMain.register('LayoutMain');

export default LayoutMain;
