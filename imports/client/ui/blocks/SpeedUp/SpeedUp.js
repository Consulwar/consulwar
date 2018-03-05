import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './SpeedUp.html';
import './SpeedUp.styl';

class SpeedUp extends BlazeComponent {
  template() {
    return 'SpeedUp';
  }
  closeWindow() {
    this.removeComponent();
  }
}

SpeedUp.register('SpeedUp');

export default SpeedUp;
