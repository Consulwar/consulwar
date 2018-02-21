import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/UserRegister/UserRegister';
import UserLogin from '/imports/client/ui/blocks/UserLogin/UserLogin';
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
    this.usernameTyping = new ReactiveVar();
  }

  onRendered() {
    super.onRendered();
    this.autorun(() => {
      if (this.usernameTyping.get() === true) {
        this.checkUsername();
      }
    });
  }

  checkUsername() {
    Meteor.call('user.checkPlainnameExists', this.username.get(), (err, exists) => {
      const usernameEl = this.childComponentsWith({ name: 'username' })[0].find('input');
      if (err) {
        usernameEl.classList.add('cw--input_errored');
        Notifications.error(
          'Не удалось проверить юзернейм',
          err.error,
        );
      } else if (exists) {
        usernameEl.classList.add('cw--input_errored');
        Notifications.error(
          'Этот логин используется',
          `Если Вы <b>${this.username.get()}</b><br/> - нажмите продолжить, чтобы войти`,
        );
      } else {
        usernameEl.classList.remove('cw--input_errored');
      }
    });
  }

  showLoginPopup() {
    Game.Popup.show({
      template: UserLogin.renderComponent(),
    });
    this.removeComponent();
  }

  showRegisterPopup() {
    Game.Popup.show({
      template: UserRegister.renderComponent(),
    });
    this.removeComponent();
  }

}

UserWelcome.register('UserWelcome');

export default UserWelcome;
