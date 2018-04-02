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
      return Meteor.user().settings
        && Meteor.user().settings.options
        && Meteor.user().settings.options.muteSound;
    }
    return SoundManager.isMuted.get();
  }
  muteToggle() {
    SoundManager.muteToggle();
  }
}

SoundManagerMute.register('SoundManagerMute');

export default SoundManagerMute;
