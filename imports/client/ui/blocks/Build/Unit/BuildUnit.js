import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import SoundManager from '/imports/client/ui/SoundManager/SoundManager';
import Maximum from '/imports/client/ui/blocks/Build/Maximum/BuildMaximum';
import SpeedUp from '/imports/client/ui/blocks/Build/SpeedUp/BuildSpeedUp';
import UnitRepair from '/imports/client/ui/blocks/Unit/Repair/UnitRepair';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import '/imports/client/ui/Input/Number/InputNumber';
import '/imports/client/ui/blocks/Unit/Characteristics/UnitCharacteristics';
import './BuildUnit.html';
import './BuildUnit.styl';

class BuildUnit extends BlazeComponent {
  template() {
    return 'BuildUnit';
  }

  constructor({
    hash: {
      unit,
    },
  }) {
    super();
    this.unit = unit;
    this.timeLeft = new ReactiveVar(null);
  }

  onCreated() {
    super.onCreated();

    this.count = new ReactiveVar(1);

    this.autorun(() => {
      const queue = this.unit.getQueue();
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

  build() {
    Meteor.call(
      'unit.build',
      {
        id: this.unit.id,
        count: this.count.get(),
      },
      function(error) {
        if (error) {
          Notifications.error('Невозможно подготовить юнитов', error.error);
        } else {
          Notifications.success('Строительство юнитов запущено');
          SoundManager.play('buildingStart');
        }
      },
    );
  }

  repair() {
    Game.Popup.show({
      template: (new UnitRepair({
        hash: {
          unit: this.unit,
        },
      })).renderComponent(),
    });
  }

  toggleDescription() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    $(this.find('.cw--BuildUnit__info')).slideToggle(function() {
      Meteor.call(
        'settings.setOption',
        'hideDescription',
        !(options && options.hideDescription),
      );
    });
  }

  setMaximum() {
    if (Game.hasPremium()) {
      this.count.set(this.getMax(this.unit));
    } else {
      Game.Popup.show({
        template: Maximum.renderComponent(),
      });
    }
  }

  showSpeedUp() {
    Game.Popup.show({
      template: SpeedUp.renderComponent(),
      data: { item: this.unit },
    });
  }

  getMax(item, accumulator = 0) {
    const price = item.getPrice();
    const alreadySpended = accumulator ? item.getPrice(accumulator) : null;
    const avalialbeResources = Game.Resources.currentValue.get();

    let minAmount = Infinity;

    Object.keys(price).forEach((res) => {
      if (res !== 'time') {
        let max;
        if (avalialbeResources[res]) {
          const tempVar = accumulator ? alreadySpended[res] : 0;
          max = Math.floor((avalialbeResources[res].amount - tempVar) / price[res]);
        } else {
          max = 0;
        }
        max += accumulator;

        if (max < minAmount) {
          minAmount = max;
        }
      }
    });

    if (minAmount === accumulator) {
      return accumulator;
    }
    return this.getMax(item, minAmount);
  }
}

BuildUnit.register('BuildUnit');

export default BuildUnit;
