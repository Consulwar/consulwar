import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Maximum from '/imports/client/ui/blocks/Maximum/Maximum';
import SpeedUp from '/imports/client/ui/blocks/SpeedUp/SpeedUp';
import '/imports/client/ui/blocks/Effect/Effect';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import './Building.html';
import './Building.styl';

class Building extends BlazeComponent {
  template() {
    return 'Building';
  }

  onCreated() {
    super.onCreated();

    this.count = new ReactiveVar();

    this.canBuild = new ReactiveVar();

    this.autorun(() => {
      let youCan = false;
      if (!this.data().building.getQueue()) {
        youCan = this.data().building.canBuild();
      } else {
        youCan = true;
      }
      this.canBuild.set(youCan);
    });
  }
  onRendered() {
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  Build() {
    if (!this.data().building.getQueue()) {
      const item = this.data().building;
      Meteor.call(
        'building.build',
        {
          id: item.id,
        },
        function(error) {
          if (error) {
            Notifications.error('Невозможно начать строительство', error.error);
          } else {
            Notifications.success('Строительство запущено');
          }
        },
      );
      if (item.getCurrentLevel() === 0) {
        Router.go(item.url({ group: item.group }));
      }
    } else {
      this.showSpeedUp();
    }
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
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

  setMaximum() {
    if (Game.hasPremium()) {
      // DO nothing
    } else {
      Game.Popup.show({
        template: Maximum.renderComponent(),
      });
    }
  }

  showSpeedUp() {
    Game.Popup.show({
      template: SpeedUp.renderComponent(),
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
