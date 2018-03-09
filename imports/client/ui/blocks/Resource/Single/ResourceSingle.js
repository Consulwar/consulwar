import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { priceTooltip } from '/moduls/game/client/helper';
import resources from '/imports/content/Resource/client';
import helpers from '/imports/client/ui/helpers';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/icon/credits/iconCredits';
import './ResourceSingle.html';
import './ResourceSingle.styl';

class ResourceSingle extends BlazeComponent {
  template() {
    return 'ResourceSingle';
  }

  onCreated() {
    super.onCreated();

    [this.resourceName] = _(this.data('resources')).keys();
    this.resource = resources[this.resourceName] || Game.Artefacts.items[this.resourceName];
    this.isShowDiff = this.data().isShowDiff;
  }

  count() {
    this.weight = this.data('resources')[this.resourceName];
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
    const tooltip = priceTooltip(this.data('resources'), this.resourceName);
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourceSingle.register('ResourceSingle');

export default ResourceSingle;
