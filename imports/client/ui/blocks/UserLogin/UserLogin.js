import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';
import { Notifications } from '/moduls/game/lib/importCompability';
import Tamily from '/imports/content/Person/client/Tamily';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/UserRegister/UserRegister';
import '/imports/client/ui/Person/image/PersonImage';
import '/imports/client/ui/Input/String/InputString';
import '/imports/client/ui/Input/Password/InputPassword';
import './UserLogin.html';
import './UserLogin.styl';

class UserLogin extends BlazeComponent {
  template() {
    return 'UserLogin';
  }

  constructor() {
    super();

    this.username = new ReactiveVar();
    this.password = new ReactiveVar();
    this.errors = new ReactiveDict();

    this.usernameValidators = [
      (value, errorBack) => {
        if (value.length > 16) {
          errorBack('Слишком длинный логин');
        } else {
          errorBack(false);
        }
      },
    ];

    this.passwordValidators = [
      (value, errorBack) => {
        if (value.length < 6) {
          errorBack('С паролем что-то не так');
        } else {
          errorBack(false);
        }
      },
    ];

    this.Tamily = Tamily;
  }

  login(event) {
    event.preventDefault();

    const inputs = this.childComponentsWith('validators');
    inputs.forEach(input => input.validate());

    if (_(this.errors.all()).values().some(val => val !== null)) {
      Notifications.error('Не получилось', _(this.errors.all()).values().filter(val => val).join('<br/>'));
    } else {
      Meteor.loginWithPassword(this.username.get(), this.password.get(), (err) => {
        if (err) {
          Notifications.error('Авторизация не удалась', err.error === 400 || err.error === 403 ? 'Неверный логин и/или пароль' : err.error);
        } else {
          Router.go('game');
          this.removeComponent();
        }
      });
    }
  }

  remindPassword() {
    Game.showInputWindow('Укажите email', '', function(email) {
      if (email) {
        Accounts.forgotPassword({
          email: email
        }, function(err) {
          if (err) {
            Notifications.error('Восстановление пароля не удалось', err.error);
          } else {
            Notifications.success('Способ восстановления кодов доступа отправлен на почту');
          }
        });
      }
    });
  }

  rememberMe({ currentTarget }) {
    if (currentTarget.checked) {
      Notifications.success('Я не забуду Вас, консул!');
    } else {
      Notifications.error('Это не поможет, Консул', 'Штука ничего не делает, она просто была в макете');
    }
  }

  showRegisterPopup() {
    this.removeComponent();
    Game.Popup.show({
      template: UserRegister.renderComponent(),
    });
  }

}

UserLogin.register('UserLogin');

export default UserLogin;
