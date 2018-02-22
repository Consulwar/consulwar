import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { ChdFeedbackWidget } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import UserWelcome from '/imports/client/ui/blocks/User/Welcome/UserWelcome';
import License from '/imports/client/ui/blocks/License/License';
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
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"/>');
  }

  showWelcomePopup() {
    Game.Popup.show({
      template: UserWelcome.renderComponent(),
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
}

LayoutMain.register('LayoutMain');

export default LayoutMain;
