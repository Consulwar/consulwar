import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import Tamily from '/imports/content/Person/client/Tamily';
import UserLogin from '/imports/client/ui/blocks/UserLogin/UserLogin';
import '/imports/client/ui/Input/String/InputString';
import '/imports/client/ui/Person/image/PersonImage';
import './UserRegister.html';
import './UserRegister.styl';

class UserRegister extends BlazeComponent {
  template() {
    return 'UserRegister';
  }

  constructor() {
    super();

    this.username = new ReactiveVar();
    this.email = new ReactiveVar();
    this.password = new ReactiveVar();
    this.passwordr = new ReactiveVar();

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
      _((username, errorBack) => {
        Meteor.call('user.checkPlainnameExists', username, (err, exists) => {
          if (err) {
            Notifications.error('Не удалось проверить юзернейм', err.error);
          } else if (exists) {
            errorBack('Такой логин уже используется');
          } else {
            errorBack(false);
          }
        });
      }).debounce(1000),
    ];

    this.Tamily = Tamily;
    this.isInviteRequired = Meteor.settings.public.isInviteRequired;
  }

  onRendered() {
    super.onRendered();
    this.autorun(() => {
      const errors = _(this.errors.all()).values().filter(val => val);
      if (errors.length) {
        // has Errors
        _(errors).flatten().forEach(text => console.log(text));
      } else {
        // no Errors
        console.log('Ошибок нет');
      }
    });
  }

  register(event) {
    event.preventDefault();
    console.log(this.errors.all());
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
