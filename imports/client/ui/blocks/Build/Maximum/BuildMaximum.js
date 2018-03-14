import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Router } from 'meteor/iron:router';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/button/button.styl';
import './BuildMaximum.html';
import './BuildMaximum.styl';

class BuildMaximum extends BlazeComponent {
  template() {
    return 'BuildMaximum';
  }

  closeWindow() {
    this.removeComponent();
  }

  getVip() {
    this.closeWindow();
    Router.go(Game.Cards.items.donate.Crazy.url());
  }
}

BuildMaximum.register('BuildMaximum');

export default BuildMaximum;
