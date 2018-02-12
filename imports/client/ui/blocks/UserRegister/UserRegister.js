import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import Tamily from '/imports/content/Person/client/Tamily';
import '/imports/client/ui/Person/image/PersonImage';
import '/imports/client/ui/Input/input.styl';
import './UserRegister.html';
import './UserRegister.styl';

class UserRegister extends BlazeComponent {
  template() {
    return 'UserRegister';
  }

  onCreated() {
    super.onCreated();
    this.Tamily = Tamily;
  }
  onRendered() {
    $(this.find('.content.scrollbar-inner')).perfectScrollbar();
  }
}

UserRegister.register('UserRegister');

export default UserRegister;
