import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './License.html';
import './License.styl';

class License extends BlazeComponent {
  template () {
    return 'License';
  }

  closeLicense () {
    this.removeComponent();
  }
}

License.register('License');

export default License;
