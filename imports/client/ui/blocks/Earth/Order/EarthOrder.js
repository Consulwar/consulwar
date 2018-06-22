import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Command, ResponseToGeneral } from '/moduls/earth/lib/generals';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { ReactiveVar } from 'meteor/reactive-var';
import { later } from 'meteor/mrt:later'; // eslint-disable-line
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/button/button.styl';
import './EarthOrder.html';
import './EarthOrder.styl';

class EarthOrder extends BlazeComponent {
  template() {
    return 'EarthOrder';
  }

  constructor({
    hash: {
      isPopup = false,
      className,
    },
  }) {
    super();

    this.className = className;
    this.isPopup = isPopup;
  }

  onCreated() {
    super.onCreated();

    // const updateScheduleTimeConfig = Game.Earth.UPDATE_SCHEDULE;
    const updateScheduleTimeConfig = 'at 16:00';
    const updateScheduleTime = later.parse.text(updateScheduleTimeConfig).schedules[0].t[0];
    this.updateScheduleDate = new Date(updateScheduleTime * 1000);

    this.userZone = Game.EarthUnits.get();
    this.zone = Game.EarthZones.getByName(this.userZone.zoneName);
    this.isShowOrder = new ReactiveVar(true);

    this.userResponse = new ReactiveVar();
  }

  timeToResponse() {
    const nextRunHours = this.updateScheduleDate.getHours();
    const nextRunMinutes = this.updateScheduleDate.getMinutes();

    const serverTime = Game.getCurrentServerTime() * 1000;
    const currentDate = new Date(serverTime);

    const nextDate = new Date(serverTime);
    nextDate.setHours(nextRunHours);
    nextDate.setMinutes(nextRunMinutes);
    nextDate.setSeconds(0);
    if (currentDate.getHours() >= nextRunHours) {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    return (nextDate.getTime() - serverTime) / 1000;
  }

  getResponse() {
    const response = Game.EarthUnits.get().generalCommand;
    if (response) {
      if (response === ResponseToGeneral.ACCEPT) {
        return 'приняли приказ';
      }
      return 'отказались';
    }
    return null;
  }

  getCommand() {
    const { command, commandTarget } = this.zone.general;
    if (command && command !== Command.NONE) {
      if (command === Command.MOVE) {
        let action = `Идем на ${commandTarget}`;
        if (Game.EarthZones.getByName(commandTarget).enemyArmy) {
          action = `В атаку на ${commandTarget}`;
        }
        return action;
      }
      return 'Держать позицию';
    }
    return null;
  }

  response(event, answer = true) {
    Meteor.call(
      'earth.responseToGeneral',
      answer,
      (error) => {
        if (error) {
          Notifications.error('Невозможно принять приказ', error.error);
        }
      },
    );
  }

  ignoreOrder() {
    this.isShowOrder.set(false);

    if (this.isPopup) {
      this.removeComponent();
    }
  }
}

EarthOrder.register('EarthOrder');

export default EarthOrder;
