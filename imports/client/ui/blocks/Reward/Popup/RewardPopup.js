import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import SoundManager from '/imports/client/ui/SoundManager/SoundManager';
import '../Reward';
import './RewardPopup.html';
import './RewardPopup.styl';

class RewardPopup extends BlazeComponent {
  template() {
    return 'RewardPopup';
  }

  constructor({
    hash: {
      reward,
      onGet,
    },
  }) {
    super();
    this.reward = reward;
    this.onGet = onGet;
  }

  onRendered() {
    super.onRendered();
    SoundManager.play('notice');
  }

  takeReward() {
    if (this.onGet) {
      this.onGet();
    }

    this.removeComponent();
  }
}

RewardPopup.register('RewardPopup');

export default RewardPopup;
