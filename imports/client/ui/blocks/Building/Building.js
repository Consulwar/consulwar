import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Effect/Effect';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/button/button.styl';
import './Building.html';
import './Building.styl';

class Building extends BlazeComponent {

  template() {
    return 'Building';
  }
  onRendered() {
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  Build() {
    const item = this.data().building;

    Meteor.call(
      'building.build',
      {
        group: item.group,
        engName: item.engName,
      },
      function(error) {
        if (error) {
          Notifications.error('Невозможно начать строительство', error.error);
        } else {
          Notifications.success('Строительство запущено');
        }
      },
    );

    if (item.currentLevel() === 0) {
      Router.go(item.url({ group: item.group }));
    }
  }
  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;

    /* TODO: Обсудить возможность установки свойств без РеРендеринга */

    $(this.find('.cw--Building__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }
  pickBonusMetal() {
    Meteor.call('getBonusResources', 'metals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный металл', error.error);
      } else {
        Notifications.success('Бонусный металл получен', `+ ${result}`);
      }
    });
  }
  pickBonusCrystal() {
    Meteor.call('getBonusResources', 'crystals', function(error, result) {
      if (error) {
        Notifications.error('Нельзя получить бонусный кристалл', error.error);
      } else {
        Notifications.success('Бонусный кристалл получен', `+ ${result}`);
      }
    });
  }

  showContainers() {
    Game.Building.special.Container.showWindow();
  }

  showMarket() {
    Game.Building.special.Market.showWindow();
  }

  resources() {
    return Game.Resources.currentValue.get();
  }

  income() {
    return Game.Resources.getIncome();
  }

  bonusStorage() {
    return Game.Resources.bonusStorage;
  }
}

Building.register('Building');

export default Building;
