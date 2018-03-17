import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import BuildBoostAdd from './Add/BuildBoostAdd';
import './BuildBoost.html';
import './BuildBoost.styl';

class BuildBoost extends BlazeComponent {
  template() {
    return 'BuildBoost';
  }
  showAddPopup() {
    Game.Popup.show({
      template: BuildBoostAdd.renderComponent(),
    });
  }
}

BuildBoost.register('BuildBoost');

export default BuildBoost;
