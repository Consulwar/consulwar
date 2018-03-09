import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Requirements.html';
import './Requirements.styl';

class Requirements extends BlazeComponent {
  template() {
    return 'Requirements';
  }
}

Requirements.register('Requirements');

export default Requirements;
