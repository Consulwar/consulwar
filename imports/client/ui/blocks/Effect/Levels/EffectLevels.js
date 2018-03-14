import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import './EffectLevels.html';
import './EffectLevels.styl';

class EffectLevels extends BlazeComponent {
  template() {
    return 'EffectLevels';
  }
  constructor({
    hash: {
      item,
      nextLevel,
    },
  }) {
    super();
    this.effects = item.effects;
    this.currentLevel = this.effects[0].level;
    this.nextLevel = nextLevel;
  }
}

EffectLevels.register('EffectLevels');

export default EffectLevels;
