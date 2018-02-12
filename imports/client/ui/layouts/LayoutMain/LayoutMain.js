import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import UserWelcome from '/imports/client/ui/blocks/UserWelcome/UserWelcome';
import '/imports/client/ui/button/button.styl';
import './LayoutMain.html';
import './LayoutMain.styl';

if (!Meteor.settings.public.isInviteRequired) {
  reCAPTCHA.config({
    publickey: Meteor.settings.public.recaptcha.publickey,
    hl: 'ru',
  });
}

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
    $(this.find('.scrollbar-inner')).perfectScrollbar();
  }

  showWelcomePopup() {
    Game.Popup.show({
      template: UserWelcome.renderComponent(),
    });
  }

  currentRouteName() {
    return Router.current().route.getName();
  }
}

LayoutMain.register('LayoutMain');

export default LayoutMain;
