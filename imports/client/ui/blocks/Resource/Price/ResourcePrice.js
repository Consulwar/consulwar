import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { Router } from 'meteor/iron:router';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Resource/Artefact.styl';
import '/imports/client/ui/blocks/Resource/Resource.styl';
import './ResourcePrice.html';
import './ResourcePrice.styl';

class ResourcePrice extends BlazeComponent {

  template() {
    return 'ResourcePrice';
  }

  getResources(priceObj) {
    const result = [];
    Object.keys(priceObj).forEach((name) => {
      const item = {
        engName: name,
        amount: priceObj[name],
        price: priceObj,
      };
      if (priceObj[name]) {
        if (name === 'time') {
          result.unshift(item);
        } else {
          result.push(item);
        }
      }
    });
    return result;
  }

  isArtefact(resourceName) {
    return Object.keys(Game.Artefacts.items).includes(resourceName);
  }

  showCredits() {
    // 'click .resources .credits'
    Game.Payment.showWindow();
  }

  showArtefacts(event, name) {
    if (this.isArtefact(name)) {
      Router.go('artefacts', {
        item: event.currentTarget.dataset.id,
      });
    }
  }
  // Game.Resources.currentValue.get()['humans'].amount
  showResource(event, name, price) {
    const target = $(event.currentTarget);
    const tooltip = Blaze._globalHelpers.priceTooltip(price, name);
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourcePrice.register('ResourcePrice');

export default ResourcePrice;
