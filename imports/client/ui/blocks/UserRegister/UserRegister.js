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
import UserLogin from '/imports/client/ui/blocks/UserLogin/UserLogin';
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

  constructor() {
    super();

    this.username = new ReactiveVar();
    this.usernameTyping = new ReactiveVar();
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

    this.passwordRepeatValidators = [
      (value, errorBack) => {
        if (this.password.get() !== value) {
          errorBack('Пароли не совпадают');
        } else {
          errorBack(false);
        }
      },
      (value, errorBack) => {
        if (value.length < 6) {
          errorBack('Пароль не может быть короче 6 символов');
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
    this.autorun(() => {
      // const errors = _(this.errors.all()).values().filter(val => val);
      // if (errors.length) {
      //   // has Errors
      //   _(errors).flatten().forEach(text => console.log(text));
      // } else {
      //   // no Errors
      //   console.log('Ошибок нет');
      // }
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
          'Выберите другой логин',
          'Такой логин уже используется',
        );
      } else {
        usernameEl.classList.remove('cw--input_errored');
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

  createAccount() {
    const options = {
      username: this.username.get(),
      email: this.email.get(),
      password: this.passwordRepeat.get(),
      code: this.code.get() || '',
    };
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
      template: UserLogin.renderComponent(),
    });
  }
}

UserRegister.register('UserRegister');

export default UserRegister;
