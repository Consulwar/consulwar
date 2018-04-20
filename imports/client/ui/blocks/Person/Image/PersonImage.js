import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import PersonSkinPopup from '../SkinPopup/PersonSkinPopup';
import './PersonImage.html';
import './PersonImage.styl';

class PersonImage extends BlazeComponent {
  template() {
    return 'PersonImage';
  }

  constructor({
    hash: {
      person,
      showChangeOption = true,
      className,
    },
  }) {
    super();

    this.person = person;
    this.showChangeOption = showChangeOption;
    this.className = className;
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
