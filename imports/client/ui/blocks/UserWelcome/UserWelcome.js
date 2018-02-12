import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import UserRegister from '/imports/client/ui/blocks/UserRegister/UserRegister';
import '/imports/client/ui/Input/input.styl';
import '/imports/client/ui/button/button.styl';
import './UserWelcome.html';
import './UserWelcome.styl';

class UserWelcome extends BlazeComponent {
  template() {
    return 'UserWelcome';
  }

  onCreated() {
    super.onCreated();
  }

  onRendered() {
  }

  showRegisterPopup() {
    Game.Popup.show({
      template: UserRegister.renderComponent(),
    });
  }

}

UserWelcome.register('UserWelcome');

export default UserWelcome;
