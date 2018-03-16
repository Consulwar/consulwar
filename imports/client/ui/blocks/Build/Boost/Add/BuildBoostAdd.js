import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './BuildBoostAdd.html';
import './BuildBoostAdd.styl';

class BuildBoostAdd extends BlazeComponent {
  template() {
    return 'BuildBoostAdd';
  }
  closeWindow() {
    this.removeComponent();
  }
}

BuildBoostAdd.register('BuildBoostAdd');

export default BuildBoostAdd;
