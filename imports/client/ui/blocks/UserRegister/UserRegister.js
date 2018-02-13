import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import Tamily from '/imports/content/Person/client/Tamily';
import UserLogin from '/imports/client/ui/blocks/UserLogin/UserLogin';
import '/imports/client/ui/Person/image/PersonImage';
import '/imports/client/ui/Input/input.styl';
import './UserRegister.html';
import './UserRegister.styl';

class UserRegister extends BlazeComponent {
  template() {
    return 'UserRegister';
  }

  onCreated() {
    super.onCreated();
    this.Tamily = Tamily;
  }
  onRendered() {
  }

  showLoginPopup() {
    Game.Popup.show({
      template: UserLogin.renderComponent(),
    });
  }
}

UserRegister.register('UserRegister');

export default UserRegister;
