import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './ContainerRewardRoller.html';
import './ContainerRewardRoller.styl';

class ContainerRewardRoller extends BlazeComponent {
  template() {
    return 'ContainerRewardRoller';
  }

  hasWinner() {
    return this.data('rewards').some(reward => reward.isWinner);
  }
}

ContainerRewardRoller.register('ContainerRewardRoller');

export default ContainerRewardRoller;
