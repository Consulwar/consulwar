import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Notifications, ChdFeedbackWidget } from '/moduls/game/lib/importCompability';
import { Router } from 'meteor/iron:router';
import Game from '/moduls/game/lib/main.game';
import RewardPopup from '/imports/client/ui/blocks/Reward/Popup/RewardPopup';
import '../Position/UserPosition';
import './UserMenu.html';
import './UserMenu.styl';

class UserMenu extends BlazeComponent {
  template() {
    return 'UserMenu';
  }

  constructor() {
    super();

    this.promoCode = new ReactiveVar();
    this.isPromoLoading = new ReactiveVar(false);
  }

  userIcon() {
    const user = Meteor.user();
    if (
      user
      && user.settings
      && user.settings.chat
      && user.settings.chat.icon
    ) {
      return user.settings.chat.icon;
    }
    return 'common/1';
  }

  isRouterName(routeName) {
    return Router.current().route.getName() === routeName;
  }

  isAdmin() {
    return Meteor.user().role === 'admin';
  }

  hasMail() {
    if (
      Game.Mail.hasUnread()
    ) {
      return true;
    }
    return false;
  }

  getServerTime() {
    return Game.getCurrentServerTime();
  }

  showIcons() {
    Game.Chat.showIconsWindow();
  }

  showFeedback(event, theme) {
    ChdFeedbackWidget.show(theme);
  }

  sendPromocode(event) {
    event.preventDefault();

    if (this.isPromoLoading.get()) {
      return;
    }

    const code = this.promoCode.get();
    if (!code || code.length === 0) {
      Notifications.error('Нужно ввести промокод');
      return;
    }

    this.isPromoLoading.set(true);

    Meteor.call(
      'user.activatePromoCode',
      code,
      (err, reward) => {
        this.isPromoLoading.set(false);
        if (err) {
          Notifications.error(err.error);
        } else {
          Game.Popup.show({
            template: (new RewardPopup({
              hash: {
                reward,
              },
            })).renderComponent(),
            hideClose: true,
          });
        }
      },
    );
  }

  showPromocodeCreate() {
    if (!this.isAdmin()) {
      return;
    }
    Game.Payment.showPromocodeCreate();
  }
  showPromocodeHistory() {
    if (!this.isAdmin()) {
      return;
    }
    Router.go('promocodeHistory', { page: 1 });
  }

  showPaymentHistory() {
    Game.Payment.showHistory();
  }

  getToken() {
    return Router.token;
  }
}

UserMenu.register('UserMenu');

export default UserMenu;
