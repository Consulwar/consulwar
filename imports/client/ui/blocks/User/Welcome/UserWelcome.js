import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Notifications } from '/moduls/game/lib/importCompability';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/User/Register/UserRegister';
import UserLogin from '/imports/client/ui/blocks/User/Login/UserLogin';
import '/imports/client/ui/Input/input.styl';
import '/imports/client/ui/button/button.styl';
import './UserWelcome.html';
import './UserWelcome.styl';

class UserWelcome extends BlazeComponent {
  template() {
    return 'UserWelcome';
  }

  constructor() {
    super();

    this.username = new ReactiveVar();
    this.userExists = false;
  }

  onRendered() {
    super.onRendered();
    const checkUser = _(username => this.checkUsername(username)).debounce(1000);
    this.autorun(() => {
      if (this.username.get()) {
        checkUser(this.username.get());
      }
    });
  }

  checkUsername(username) {
    Meteor.call('user.checkPlainnameExists', username, (err, exists) => {
      const usernameEl = this.childComponentsWith({ name: 'username' })[0];
      if (usernameEl) {
        if (err) {
          usernameEl.addError();
          Notifications.error(
            'Не удалось проверить юзернейм',
            err.error,
          );
        } else if (exists) {
          this.userExists = true;
          usernameEl.addError();
          Notifications.error(
            'Этот логин используется',
            `Если Вы <b>${this.username.get()}</b><br/> - нажмите продолжить, чтобы войти`,
          );
        } else {
          this.userExists = false;
          usernameEl.removeError();
        }
      }
    });
  }

  goNext() {
    if (this.userExists === true) {
      this.showLoginPopup();
    } else {
      this.showRegisterPopup();
    }
  }

  showLoginPopup() {
    Game.Popup.show({
      template: (new UserLogin({ hash: {
        username: this.username.get(),
      } })).renderComponent(),
    });
    this.removeComponent();
  }

  showRegisterPopup() {
    Game.Popup.show({
      template: (new UserRegister({ hash: {
        username: this.username.get(),
      } })).renderComponent(),
    });
    this.removeComponent();
  }

}

UserWelcome.register('UserWelcome');

export default UserWelcome;
