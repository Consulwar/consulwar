import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import resourceItems from '/imports/content/Resource/client';
import './ResourceCurrent.html';
import './ResourceCurrent.styl';

class ResourceCurrent extends BlazeComponent {
  template() {
    return 'ResourceCurrent';
  }

  getResources() {
    const resourceArray = [];
    _.toPairs(Game.Resources.getValue()).forEach(([id, value]) => {
      const showingResources = [
        'humans',
        'metals',
        'crystals',
        'honor',
        'credits',
      ];
      if (showingResources.includes(id)) {
        resourceArray.push({
          obj: resourceItems[id],
          count: value.amount,
        });
      }
    });
    return resourceArray;
  }

  showCredits() {
    Game.Payment.showWindow();
  }

  showResourceTooltip(event) {
    const target = $(event.currentTarget);
    const tooltip = Blaze._globalHelpers.incomeTooltip(
      Game.Resources.getIncome().effects,
      target.attr('data-type'),
    );
    target.attr('data-tooltip-direction', 's');
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourceCurrent.register('ResourceCurrent');

export default ResourceCurrent;
