import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Tamily from '/imports/content/Person/client/Tamily';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/UserRegister/UserRegister';
import '/imports/client/ui/Person/image/PersonImage';
import './UserLogin.html';
import './UserLogin.styl';

class UserLogin extends BlazeComponent {
  template() {
    return 'UserLogin';
  }

  onCreated() {
    super.onCreated();
    this.Tamily = Tamily;
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
