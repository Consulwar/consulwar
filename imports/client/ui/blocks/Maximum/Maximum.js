import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Router } from 'meteor/iron:router';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/button/button.styl';
import './Maximum.html';
import './Maximum.styl';

class Maximum extends BlazeComponent {
  template() {
    return 'Maximum';
  }

  closeWindow() {
    this.removeComponent();
  }

  getVip() {
    this.closeWindow();
    Router.go(Game.Cards.items.donate.Crazy.url());
  }
}

Maximum.register('Maximum');

export default Maximum;
