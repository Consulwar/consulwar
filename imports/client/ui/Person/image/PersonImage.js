import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import PersonSkinPopup from '../skinPopup/PersonSkinPopup';
import './PersonImage.html';
import './PersonImage.styl';

class PersonImage extends BlazeComponent {
  template() {
    return 'PersonImage';
  }

  onCreated() {
    super.onCreated();

    this.person = this.data('person');
  }

  changeAvatar() {
    Game.Popup.show({
      template: PersonSkinPopup.renderComponent(),
      data: { person: this.person },
    });
  }
}

PersonImage.register('PersonImage');

export default PersonImage;
