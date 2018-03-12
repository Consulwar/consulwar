import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Accounts } from 'meteor/accounts-base';
import { _ } from 'meteor/underscore';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import Tamily from '/imports/content/Person/client/Tamily';
import UserLogin from '/imports/client/ui/blocks/User/Login/UserLogin';
import License from '/imports/client/ui/blocks/License/License';
import '/imports/client/ui/Input/String/InputString';
import '/imports/client/ui/Input/Email/InputEmail';
import '/imports/client/ui/Input/Password/InputPassword';
import '/imports/client/ui/Input/Checkbox/InputCheckbox';
import '/imports/client/ui/Person/image/PersonImage';
import '/imports/client/ui/button/button.styl';
import './UserRegister.html';
import './UserRegister.styl';

class UserRegister extends BlazeComponent {
  template() {
    return 'UserRegister';
  }

  constructor({
    hash: {
      username = '',
    },
  } = { hash: {} }) {
    super();

    this.username = new ReactiveVar(username);
    this.email = new ReactiveVar();
    this.password = new ReactiveVar();
    this.passwordRepeat = new ReactiveVar();
    this.code = new ReactiveVar();
    this.rulesAccept = new ReactiveVar();

    this.errors = new ReactiveDict();

    this.usernameValidators = [
      (value, errorBack) => {
        if (value.length > 16) {
          errorBack('Максимум 16 символов');
        } else {
          errorBack(false);
        }
      },
      (value, errorBack) => {
        if (value.length === 0) {
          errorBack('Логин должен быть');
        } else {
          errorBack(false);
        }
      },
      (value, errorBack) => {
        if (!value.match(/^[a-zA-Zа-яА-Я0-9_\- ]+$/)) {
          errorBack('В логине допускаются английские и русские буквы, пробел, подчеркивание и дефис');
        } else {
          errorBack(false);
        }
      },
    ];

    this.emailValidators = [
      (value, errorBack) => {
        if (value.length < 3) {
          errorBack('Слишком короткий Eмэйл');
        } else {
          errorBack(false);
        }
      },
      (value, errorBack) => {
        if (value.match('@') === null) {
          errorBack('В почте должна быть @');
        } else {
          errorBack(false);
        }
      },
    ];

    this.passwordValidators = [
      (value, errorBack) => {
        if (value.length < 6) {
          errorBack('Пароль не может быть короче 6 символов');
        } else {
          errorBack(false);
        }
      },
    ];
    this.passwordRepeatValidators = [
      (value, errorBack) => {
        if (this.passwordRepeat.get() !== this.password.get()) {
          errorBack('Пароли не совпадают');
        } else {
          errorBack(false);
        }
      },
    ];

    this.Tamily = Tamily;
    this.isInviteRequired = Meteor.settings.public.isInviteRequired;
  }

  onRendered() {
    super.onRendered();
    const checkUser = _(username => this.checkUsername(username)).debounce(2000);
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
          usernameEl.addError('Такой логин уже используется');
          Notifications.error(
            'Выберите другой логин',
            'Такой логин уже используется',
          );
        }
      }
    });
  }

  register(event) {
    event.preventDefault();

    const inputs = this.childComponentsWith('validators');
    inputs.forEach(input => input.validate());

    if (_(this.errors.all()).values().some(val => val !== null)) {
      Notifications.error(
        'Не получилось',
        _(this.errors.all()).values()
          .filter(val => val)
          .flatten()
          .join('<br/>'),
      );
    } else {
      this.createAccount();
    }
  }

  getErrors() {
    return _(this.errors.all()).chain()
      .values()
      .filter(val => val)
      .flatten()
      .uniq()
      .value();
  }

  createAccount() {
    const options = {
      username: this.username.get(),
      email: this.email.get(),
      password: this.passwordRepeat.get(),
    };
    if (Meteor.settings.public.isInviteRequired) {
      options.code = this.code.get() || '';
    } else {
      options.captcha = window.grecaptcha.getResponse() || '';
      window.grecaptcha.reset();
    }
    Accounts.createUser(options, (err) => {
      if (err) {
        Notifications.error(
          'Не удалось зарегистрировать пользователя',
          err.error,
        );
      } else {
        Router.go('game');
        this.removeComponent();
      }
    });
  }

  showLicense() {
    Game.Popup.show({
      template: License.renderComponent(),
    });
  }

  showLoginPopup() {
    this.removeComponent();
    Game.Popup.show({
      template: (new UserLogin({
        hash: {
          username: this.username.get(),
        },
      })).renderComponent(),
    });
  }
}

UserRegister.register('UserRegister');

export default UserRegister;
