import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Notifications } from '/moduls/game/lib/importCompability';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/User/Register/UserRegister';
import UserLogin from '/imports/client/ui/blocks/User/Login/UserLogin';
import '/imports/client/ui/Input/Input.styl';
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
    this.errors = new ReactiveDict();
    this.userExists = false;
  }

  onRendered() {
    super.onRendered();
    const checkUser = _(username => this.checkUsername(username)).debounce(300);
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
        usernameEl.removeError('Такой логин уже используется');
        usernameEl.removeError('Не удалось проверить юзернейм');
        if (err) {
          usernameEl.addError('Не удалось проверить юзернейм');
          Notifications.error(
            'Не удалось проверить юзернейм',
            err.error,
          );
        } else if (exists) {
          this.userExists = true;
          usernameEl.addError('Такой логин уже используется');
        } else {
          this.userExists = false;
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
      template: (new UserLogin({
        hash: {
          username: this.username.get(),
        },
      })).renderComponent(),
      isMain: true,
    });
    this.removeComponent();
  }

  showRegisterPopup() {
    Game.Popup.show({
      template: (new UserRegister({
        hash: {
          username: this.username.get(),
        },
      })).renderComponent(),
      isMain: true,
    });
    this.removeComponent();
  }
}

UserWelcome.register('UserWelcome');

export default UserWelcome;
