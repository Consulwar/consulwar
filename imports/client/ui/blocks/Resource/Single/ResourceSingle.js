import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { priceTooltip } from '/moduls/game/client/helper';
import resourceItems from '/imports/content/Resource/client';
import helpers from '/imports/client/ui/helpers';
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
  }

  onCreated() {
    super.onCreated();

    [this.resourceName] = _(this.resources).keys();
    this.resource = resourceItems[this.resourceName] || Game.Artefacts.items[this.resourceName];
  }

  count() {
    this.weight = this.resources[this.resourceName];
    if (this.isShowDiff) {
      const UserResources = Game.Resources.getValue();
      let userHas = 0;
      if (UserResources[this.resourceName]) {
        userHas = UserResources[this.resourceName].amount;
        if (userHas > this.weight) {
          userHas = this.weight;
        }
      }
      const weight = helpers.formatNumberWithIso(this.weight);
      const has = helpers.formatNumberWithIso(userHas);

      return `${has} / ${weight}`;
    }
    return helpers.formatNumberWithIso(this.weight);
  }

  buyCredits() {
    Game.Payment.showWindow();
  }

  showTooltip(event) {
    const target = $(event.currentTarget);
    const tooltip = priceTooltip(this.resources, this.resourceName);
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourceSingle.register('ResourceSingle');

export default ResourceSingle;
