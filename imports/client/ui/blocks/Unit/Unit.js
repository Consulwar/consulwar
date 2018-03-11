import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { $ } from 'meteor/jquery';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Maximum from '/imports/client/ui/blocks/Maximum/Maximum';
import SpeedUp from '/imports/client/ui/blocks/SpeedUp/SpeedUp';
import UnitRepair from '/imports/client/ui/blocks/Unit/Repair/UnitRepair';
import '/imports/client/ui/blocks/Effect/Effect';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/blocks/Requirements/Requirements';
import '/imports/client/ui/button/button.styl';
import '/imports/client/ui/Input/Number/InputNumber';
import '/imports/client/ui/blocks/Unit/Characteristics/UnitCharacteristics';
import './Unit.html';
import './Unit.styl';

class Unit extends BlazeComponent {
  template() {
    return 'Unit';
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

  Build() {
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
        }
      },
    );
  }

  Repair() {
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
    $(this.find('.cw--Unit__info')).slideToggle(function() {
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
    const price = item.price();
    const alreadySpended = accumulator ? item.price(accumulator) : null;
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

Unit.register('Unit');

export default Unit;
