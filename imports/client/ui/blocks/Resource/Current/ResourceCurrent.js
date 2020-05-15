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

  constructor({
    hash: {
      resourceList = [
        resourceItems['Resource/Base/Human'],
        resourceItems['Resource/Base/Metal'],
        resourceItems['Resource/Base/Crystal'],
        resourceItems['Resource/Base/Honor'],
        resourceItems['Resource/Base/Credit'],
      ],
      disableTooltip = false,
      enableArtifacts = true,
      className = null,
      onClick = () => {},
    } = {},
  } = {}) {
    super();

    this.onClick = onClick;
    this.className = className;
    this.resourceList = resourceList;
    this.resourceEngNames = resourceList.map(x => x.engName);
    this.engNameToObject = _.keyBy(resourceList, x => x.engName);
    this.disableTooltip = disableTooltip;
    this.enableArtifacts = enableArtifacts;
  }

  isArtifactPage() {
    return Router.current().group === 'artefacts';
  }

  getResources() {
    const resourceArray = [];
    _.toPairs(_.pick(
      Game.Resources.currentValue.get(),
      this.resourceEngNames,
    )).forEach(([engName, value]) => {
      resourceArray.push({
        obj: this.engNameToObject[engName],
        count: value.amount,
      });
    });
    return resourceArray;
  }

  showCredits() {
    Game.Payment.showWindow();
  }

  showResourceTooltip(event, resource) {
    if (this.disableTooltip) {
      return;
    }

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
