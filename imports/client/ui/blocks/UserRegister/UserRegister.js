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
    this.errors = new ReactiveDict();
    this.usernameValidators = [
      (value, error) => {
        if (value.length > 16) {
          error('Максимум 16 символов');
        } else {
          error(false);
        }
      },
      (value, error) => {
        if (value.length === 0) {
          error('Логин должен быть');
        } else {
          error(false);
        }
      },
      _((username, error) => {
        Meteor.call('user.checkPlainnameExists', username, (err, exists) => {
          if (err) {
            Notifications.error('Не удалось проверить юзернейм', err.error);
          } else if (exists) {
            error('Такой логин уже используется');
          } else {
            error(false);
          }
        });
      }).debounce(1000),
    ];

    Tracker.autorun(() => {
      const errors = _(this.errors.all()).values().filter(val => val);
      if (errors.length) {
        _(errors).flatten().forEach(text => console.log(text));
      } else {
        console.log('Ошибок нет');
      }
    });

    this.Tamily = Tamily;
    this.isInviteRequired = Meteor.settings.public.isInviteRequired;
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
