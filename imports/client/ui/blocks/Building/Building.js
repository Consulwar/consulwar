import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Maximum from '/imports/client/ui/blocks/Maximum/Maximum';
import SpeedUp from '/imports/client/ui/blocks/SpeedUp/SpeedUp';
import '/imports/client/ui/blocks/Effect/Levels/EffectLevels';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import './Building.html';
import './Building.styl';

class Building extends BlazeComponent {
  template() {
    return 'Building';
  }

  constructor({
    hash: {
      building,
      level,
      submenu,
    },
  }) {
    super();
    this.building = building;
    this.level = level;
    this.submenu = submenu;
    this.timeLeft = new ReactiveVar(null);
  }

  onCreated() {
    super.onCreated();
    if (this.building.maxLevel < this.level.get()) {
      this.level.set(120);
    }
    this.autorun(() => {
      const queue = this.building.getQueue();
      if (queue) {
        this.timeLeft.set(queue.finishTime - Game.getCurrentServerTime());
      } else {
        this.timeLeft.set(null);
      }
    });
  }

  onRendered() {
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  build() {
    Meteor.call(
      'building.build',
      {
        id: this.building.id,
        level: this.level.get(),
      },
      function(error) {
        if (error) {
          Notifications.error('Невозможно начать строительство', error.error);
        } else {
          Notifications.success('Строительство запущено');
        }
      },
    );
    if (this.building.getCurrentLevel() === 0) {
      Router.go(this.building.url({ group: this.building.group }));
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
      let currentLevel = this.building.getCurrentLevel() + 1;
      while (
        (currentLevel + 1) <= this.building.maxLevel
        && this.building.canBuild(currentLevel + 1)
      ) {
        currentLevel += 1;
      }
      this.level.set(currentLevel);
    } else {
      Game.Popup.show({
        template: Maximum.renderComponent(),
      });
    }
  }

  showSpeedUp() {
    Game.Popup.show({
      template: SpeedUp.renderComponent(),
      data: { item: this.building },
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
  getRequirements() {
    return this.building.getRequirements({ level: this.level.get() });
  }
}

Building.register('Building');

export default Building;
