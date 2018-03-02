import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Blaze } from 'meteor/blaze';
import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';
import './ResourcePrice.html';
import './ResourcePrice.styl';

class ResourcePrice extends BlazeComponent {

  template() {
    return 'ResourcePrice';
  }

  getResources(priceObj) {
    const result = [];
    _(priceObj).keys().forEach((name) => {
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

  isArtefact(key) {
    return Game.Artefacts.items[key] !== null;
  }

  showCredits() {
    // 'click .resources .credits'
    Game.Payment.showWindow();
  }

  showArtefacts(event) {
    Router.go('artefacts', {
      // 'click .resources .artefact'
      item: event.currentTarget.dataset.id,
    });
  }

  showResource(event) {
    // 'mouseover .resources > div'
    const target = $(event.currentTarget);
    const tooltip = Blaze._globalHelpers.priceTooltip(
      this.price,
      this.engName,
    );
    target.attr('data-tooltip', tooltip['data-tooltip']);
  }
}

ResourcePrice.register('ResourcePrice');

export default ResourcePrice;
