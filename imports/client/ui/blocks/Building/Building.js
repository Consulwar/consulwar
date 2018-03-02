import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/blocks/Effect/Effect';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
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
  resources() {
    return Game.Resources.currentValue.get();
  }

  income() {
    return Game.Resources.getIncome();
  }

  bonusStorage() {
    return Game.Resources.bonusStorage;
  }
  containers() {
    Game.Building.special.Container.showWindow();
  }
  market() {
    Game.Building.special.Market.showWindow();
  }
}

Building.register('Building');

export default Building;
