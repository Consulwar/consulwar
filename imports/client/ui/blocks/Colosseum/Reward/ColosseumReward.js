import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './ColosseumReward.html';
import './ColosseumReward.styl';

class ColosseumReward extends BlazeComponent {
  template() {
    return 'ColosseumReward';
  }
  constructor({
    hash: {
      reward,
    },
  }) {
    super();
    this.reward = reward;
  }
  closeWindow() {
    this.removeComponent();
  }
}

ColosseumReward.register('ColosseumReward');

export default ColosseumReward;
