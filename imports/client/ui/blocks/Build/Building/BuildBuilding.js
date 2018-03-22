import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Maximum from '/imports/client/ui/blocks/Build/Maximum/BuildMaximum';
import SpeedUp from '/imports/client/ui/blocks/Build/SpeedUp/BuildSpeedUp';
import '/imports/client/ui/blocks/Effect/Levels/EffectLevels';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import './BuildBuilding.html';
import './BuildBuilding.styl';

class BuildBuilding extends BlazeComponent {
  template() {
    return 'BuildBuilding';
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
    super.onRendered();
    $('.scrollbar-inner').perfectScrollbar('update');
  }

  getRequirements() {
    return this.building.getRequirements({ level: this.level.get() });
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
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--BuildBuilding__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  pickBonus(event, id = this.building.id) {
    let resource = '';
    let resourceRu = '';
    if (id === 'Building/Residential/Crystal') {
      resource = 'crystals';
      resourceRu = 'кристалл';
    } else if (id === 'Building/Residential/Metal') {
      resource = 'metals';
      resourceRu = 'металл';
    }
    Meteor.call('getBonusResources', resource, (error, result) => {
      if (error) {
        Notifications.error(`Нельзя получить бонусный ${resourceRu}`, error.error);
      } else {
        Notifications.success(`Бонусный ${resourceRu} получен`, `+ ${result}`);
      }
    });
  }

  isShowProgress(id = this.building.id) {
    if (id === 'Building/Residential/Crystal' || id === 'Building/Residential/Metal') {
      return true;
    }
    return false;
  }

  getButton(id = this.building.id) {
    if (id === 'Building/Residential/Metal' || id === 'Building/Residential/Crystal') {
      return {
        action: () => this.pickBonus(),
        text: 'Собрать',
      };
    } else if (id === 'Building/Residential/SpacePort') {
      return {
        action: () => this.showContainers(),
        text: 'Контейнер',
      };
    } else if (id === 'Building/Residential/TradingPort') {
      return {
        action: () => this.showMarket(),
        text: 'Торговать',
      };
    } else if (id === 'Building/Residential/Colosseum') {
      return {
        action: () => this.showTournament(),
        text: 'Турнир',
      };
    } else if (id === 'Building/Residential/PulseCatcher') {
      return {
        action: () => this.showBonus(),
        text: 'Бонус',
      };
    }
    return false;
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

  showTournament() {
    Router.go('building', {
      group: 'Residential',
      item: 'Colosseum',
      menu: 'tournaments',
    });
  }

  showBonus() {
    Router.go('building', {
      group: 'Residential',
      item: 'PulseCatcher',
      menu: 'bonus',
    });
  }

  resourcesBonus(id = this.building.id) {
    if (id === 'Building/Residential/Crystal') {
      return Game.Resources.currentValue.get().crystals.bonus;
    } else if (id === 'Building/Residential/Metal') {
      return Game.Resources.currentValue.get().metals.bonus;
    }
    return false;
  }

  income(id = this.building.id) {
    if (id === 'Building/Residential/Crystal') {
      return Game.Resources.getIncome().crystals;
    } else if (id === 'Building/Residential/Metal') {
      return Game.Resources.getIncome().metals;
    }
    return false;
  }

  bonusStorage() {
    return Game.Resources.bonusStorage;
  }
}

BuildBuilding.register('BuildBuilding');

export default BuildBuilding;
