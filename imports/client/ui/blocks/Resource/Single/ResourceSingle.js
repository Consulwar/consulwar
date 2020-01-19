import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { priceTooltip } from '/moduls/game/client/helper';
import resourceItems from '/imports/content/Resource/client';
import helpers from '/imports/lib/ui/helpers';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/icon/credits/iconCredits';
import './ResourceSingle.html';
import './ResourceSingle.styl';

class ResourceSingle extends BlazeComponent {
  template() {
    return 'ResourceSingle';
  }

  constructor({
    hash: {
      resources,
      isShowDiff = false,
      className,
    },
  }) {
    super();
    this.resources = resources;
    this.isShowDiff = isShowDiff;
    this.className = className;
    [this.resourceName] = _(this.resources).keys();
    this.resource = resourceItems[this.resourceName]
      || Game.Artefacts.items[this.resourceName];
  }

  count() {
    const weight = this.resources[this.resourceName];
    const weightFormated = helpers.formatNumberWithIso(weight);
    if (this.isShowDiff) {
      const userResource = Game.Resources.getAvailable(this.resourceName, weight);
      const userResourceFormated = helpers.formatNumberWithIso(userResource);

      return `${userResourceFormated} / ${weightFormated}`;
    }
    return weightFormated;
  }

  showTooltip(event) {
    const target = $(event.currentTarget);
    const tooltip = priceTooltip(this.resources, this.resourceName);
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourceSingle.register('ResourceSingle');

export default ResourceSingle;
