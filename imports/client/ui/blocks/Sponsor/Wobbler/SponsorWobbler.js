import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import { Meteor } from 'meteor/meteor';
import Sponsor from '../Sponsor';
import './SponsorWobbler.html';
import './SponsorWobbler.styl';

class SponsorWobbler extends BlazeComponent {
  template() {
    return 'SponsorWobbler';
  }

  hasTime() {
    return (Meteor.settings.public.event.endTime / 1000) > Game.getCurrentServerTime();
  }

  showSponsorPopup() {
    Game.Popup.show({
      template: Sponsor.renderComponent(),
    });
  }
}

SponsorWobbler.register('SponsorWobbler');

export default SponsorWobbler;
