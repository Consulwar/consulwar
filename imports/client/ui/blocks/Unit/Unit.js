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
import '/imports/client/ui/Input/Number/InputNumber';
import '/imports/client/ui/blocks/Unit/Characteristics/UnitCharacteristics';
import './Unit.html';
import './Unit.styl';

class Unit extends BlazeComponent {
  template() {
    return 'Unit';
  }

  onCreated() {
    super.onCreated();

    this.count = new ReactiveVar(1);

    this.canBuild = new ReactiveVar();

    this.autorun(() => {
      let youCan = false;
      if (!this.data().unit.getQueue()) {
        youCan = this.data().unit.canBuild();
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
    if (!this.data().unit.getQueue()) {
      const item = this.data().unit;
      Meteor.call(
        'unit.build',
        {
          id: item.id,
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
      if (item.getTotalCount() === 0) {
        Router.go(item.url({ group: item.group }));
      }
    } else {
      this.showSpeedUp();
    }
  }

  Repair() {
    Game.Wrecks.showPopup(this.data().unit);
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
      const item = this.data().unit;
      this.count.set(this.getMax(item));
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
