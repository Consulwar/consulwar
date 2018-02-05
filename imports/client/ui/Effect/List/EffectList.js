import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import './EffectList.html';
import './EffectList.styl';

class EffectList extends BlazeComponent {
  template() {
    return 'EffectList';
  }

  constructor({ hash: {
    level,
    effects,
    hideAdditional = false,
    additionalClass = '',
  } }) {
    super();

    this.level = level;

    this.additionalClass = additionalClass;

    this.allEffects = [...effects];
    if (this.allEffects.length > 1) {
      this.hideAdditional = hideAdditional;
    } else {
      this.hideAdditional = false;
    }

    if (this.hideAdditional) {
      this.effects = [this.allEffects.shift()];
    } else {
      this.effects = this.allEffects;
    }
  }

  generateTooltip(event) {
    const tooltip = new EffectList({ hash: {
      effects: this.allEffects,
      hideAdditional: false,
      level: this.level,
      additionalClass: this.additionalClass,
    } });

    $(event.currentTarget).attr({
      'data-tooltip': tooltip.renderComponentToHTML(),
      'data-tooltip-direction': 'w',
    });
  }
}

EffectList.register('EffectList');

export default EffectList;
