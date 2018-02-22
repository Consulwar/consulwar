import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import '/imports/client/ui/button/button.styl';
import './License.html';
import './License.styl';

class License extends BlazeComponent {
  template() {
    return 'License';
  }

  closeLicense() {
    this.removeComponent();
  }
}

License.register('License');

export default License;
