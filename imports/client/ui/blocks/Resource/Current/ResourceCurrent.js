import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { incomeTooltip } from '/moduls/game/client/helper';
import Game from '/moduls/game/lib/main.game';
import resourceItems from '/imports/content/Resource/client';
import './ResourceCurrent.html';
import './ResourceCurrent.styl';

class ResourceCurrent extends BlazeComponent {
  template() {
    return 'ResourceCurrent';
  }

  isArtifactPage() {
    return Router.current().group === 'artefacts';
  }

  getResources() {
    const resourceArray = [];
    _.toPairs(_.pick(
      Game.Resources.getValue(),
      ['humans', 'metals', 'crystals', 'honor', 'credits'],
    )).forEach(([id, value]) => {
      resourceArray.push({
        obj: resourceItems[id],
        count: value.amount,
      });
    });
    return resourceArray;
  }

  showCredits() {
    Game.Payment.showWindow();
  }

  showResourceTooltip(event, resource) {
    const target = $(event.currentTarget);
    const tooltip = incomeTooltip(
      Game.Resources.getIncome().effects,
      resource.engName,
    );
    target.attr({
      'data-tooltip-direction': 's',
      'data-tooltip': tooltip['data-tooltip'],
    });
  }
}

ResourceCurrent.register('ResourceCurrent');

export default ResourceCurrent;
