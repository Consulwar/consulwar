import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import SoundManager from '../SoundManager';
import './SoundManagerMute.html';
import './SoundManagerMute.styl';

class SoundManagerMute extends BlazeComponent {
  template() {
    return 'SoundManagerMute';
  }
  isMute() {
    return Meteor.user().settings.options.muteSound;
  }
  muteToggle() {
    SoundManager.muteToggle();
  }
}

SoundManagerMute.register('SoundManagerMute');

export default SoundManagerMute;
