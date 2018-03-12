import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './EffectLevels.html';
import './EffectLevels.styl';

class EffectLevels extends BlazeComponent {
  template() {
    return 'EffectLevels';
  }
}

EffectLevels.register('EffectLevels');

export default EffectLevels;
