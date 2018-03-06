import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import resources from '/imports/content/Resource/client';
import helpers from '/imports/client/ui/helpers';
import oldHelpers from '/moduls/game/client/helper';
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

    this.resource = resources[this.resourceName];
  }

  count() {
    return helpers.formatNumberWithIso(this.data('resources')[this.resourceName]);
  }

  showTooltip(event) {
    const target = $(event.currentTarget);
    const tooltip = oldHelpers.priceTooltip(
      this.data('resources'),
      this.resourceName,
    );
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourceSingle.register('ResourceSingle');

export default ResourceSingle;
