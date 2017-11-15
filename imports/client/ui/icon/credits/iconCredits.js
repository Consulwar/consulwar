import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import './iconCredits.html';
import './iconCredits.styl';

class iconCredits extends BlazeComponent {
  template() {
    return 'iconCredits';
  }

  buyCredits() {
    Game.Payment.showWindow();
  }
}

iconCredits.register('iconCredits');

export default iconCredits;
