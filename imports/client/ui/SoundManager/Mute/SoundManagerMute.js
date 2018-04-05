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
    if (Meteor.user()) {
      SoundManager.isMuted.set(SoundManager.getUserMute());
    }
    return SoundManager.isMuted.get();
  }
  muteToggle() {
    SoundManager.muteToggle();
  }
}

SoundManagerMute.register('SoundManagerMute');

export default SoundManagerMute;
