import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { Router } from 'meteor/iron:router';
import Game from '/moduls/game/lib/main.game';
import resourceItems from '/imports/content/Resource/client';

import './MenuExtras.html';
import './MenuExtras.styl';

class MenuExtras extends BlazeComponent {
  template() {
    return 'MenuExtras';
  }

  constructor({
    hash: {
      buildingID,
    },
  }) {
    super();

    this.buildingID = buildingID;

    this.resource = '';
    this.text = '';

    if (this.buildingID === 'Building/Residential/Metal') {
      this.resource = 'metals';
      this.text = 'металл';
    } else if (this.buildingID === 'Building/Residential/Crystal') {
      this.resource = 'crystals';
      this.text = 'кристалл';
    }
  }

  getIcon() {
    if (this.buildingID === 'Building/Residential/Colosseum') {
      return '/img/game/colosseum/collect.svg';
    } else if (this.buildingID === 'Building/Residential/PulseCatcher') {
      return '/img/game/pulsecatcher/collect.svg';
    }
    return false;
  }

  getBonus() {
    if (this.resource) {
      const value = Game.Resources.currentValue.get()[this.resource].bonus || 0;
      const income = Game.Resources.getIncome()[this.resource];
      let percent = (value * 100) / (income * Game.Resources.bonusStorage);

      const pieces = [];
      while (percent >= 20) {
        percent -= 20;
        pieces.push(1);
      }

      if (pieces.length > 0) {
        return {
          value,
          pieces,
          icon: resourceItems[this.resource].icon,
        };
      }
    }
    return false;
  }

  collectBonus(event) {
    event.preventDefault();

    Meteor.call('getBonusResources', this.resource, (error, result) => {
      if (error) {
        Notifications.error(`Нельзя получить бонусный ${this.text}`, error.error);
      } else {
        Notifications.success(`Бонусный ${this.text} получен`, `+${result}`);
      }
    });
  }

  showPage(event) {
    event.preventDefault();
    if (this.buildingID === 'Building/Residential/Colosseum') {
      Router.go('building', {
        group: 'Residential',
        item: 'Colosseum',
        menu: 'tournaments',
      });
    } else if (this.buildingID === 'Building/Residential/PulseCatcher') {
      Router.go('building', {
        group: 'Residential',
        item: 'PulseCatcher',
        menu: 'bonus',
      });
    }
  }

  isReady() {
    if (
      this.buildingID === 'Building/Residential/Colosseum'
      && Game.Building.special.Colosseum.checkCanStart()
    ) {
      return true;
    } else if (
      this.buildingID === 'Building/Residential/PulseCatcher'
      && Game.Building.special.Pulsecatcher.canActivate()
    ) {
      return true;
    }

    return false;
  }

  isResidential() {
    const pathResidential = Router.path('building', { group: 'Residential' });
    const currentUrl = Router.current().url;
    // convert Router.current().url to path after F5
    const pathCurrent = currentUrl.substr(currentUrl.indexOf('/game'));
    if (pathCurrent === pathResidential) {
      return true;
    }
    return false;
  }
}

MenuExtras.register('MenuExtras');

export default MenuExtras;
