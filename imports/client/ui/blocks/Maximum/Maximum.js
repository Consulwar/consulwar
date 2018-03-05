import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import '/imports/client/ui/button/button.styl';
import './Maximum.html';
import './Maximum.styl';

class Maximum extends BlazeComponent {
  template() {
    return 'Maximum';
  }

  closeWindow() {
    this.removeComponent();
  }
}

Maximum.register('Maximum');

export default Maximum;
