import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './Effect.html';
import './Effect.styl';

class Effect extends BlazeComponent {

  template() {
    return 'Effect';
  }
}

Effect.register('Effect');

export default Effect;
