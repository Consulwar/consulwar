import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Notifications } from '/moduls/game/lib/importCompability';
import { Command } from '/moduls/earth/lib/generals';
import { later } from 'meteor/mrt:later'; // eslint-disable-line
import Game from '/moduls/game/lib/main.game';
import './EarthGeneral.html';
import './EarthGeneral.styl';

class EarthGeneral extends BlazeComponent {
  template() {
    return 'EarthGeneral';
  }

  onCreated() {
    super.onCreated();

    const generalCommandTimeConfig = Game.Earth.TIME_TO_GENERAL_COMMAND;
    const generalCommandTime = later.parse.text(generalCommandTimeConfig).schedules[0].t[0];
    this.generalCommandDate = new Date(generalCommandTime * 1000);

    this.target = new ReactiveVar(null);
    this.generalZoneName = Game.EarthUnits.get().zoneName;
    this.generalZone = this.getGeneralZone();
    this.order = new ReactiveVar(null);

    this.setOrder();
  }

  getGeneralZone() {
    return Game.EarthZones.getByName(this.generalZoneName);
  }

  generalCommandEndTime() {
    const nextCommandHours = this.generalCommandDate.getHours();
    const nextCommandMinutes = this.generalCommandDate.getMinutes();
    const serverTime = Game.getCurrentServerTime() * 1000;
    const currentDate = new Date(serverTime);
    const nextDate = new Date(serverTime);
    nextDate.setHours(nextCommandHours);
    nextDate.setMinutes(nextCommandMinutes);
    nextDate.setSeconds(0);
    if (currentDate.getHours() >= nextCommandHours) {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    return (nextDate.getTime() - serverTime) / 1000;
  }

  setOrder() {
    const { command, commandTarget } = this.getGeneralZone().general;
    if (command) {
      if (command === Command.MOVE) {
        this.order.set(`Идем на ${commandTarget}`);
      } else {
        this.order.set('Держим позицию');
      }
    } else {
      this.order.set(null);
    }
  }

  getLinks() {
    const { generalZone, generalZoneName } = this;

    const links = [];

    const currentGeneralZone = {
      name: generalZoneName,
      action: `Удерживать ${generalZoneName}`,
    };
    links.push(currentGeneralZone);

    (generalZone.links).forEach((link) => {
      const zone = Game.EarthZones.getByName(link);
      let action = `Идем на ${link}`;
      if (zone.enemyArmy) {
        action = `В атаку на ${link}`;
      }
      links.push({
        name: link,
        action,
      });
    });
    return links;
  }

  setTarget({ currentTarget }) {
    // setting target zone by onChange
    const newValue = currentTarget.value;
    if (newValue) {
      this.target.set(newValue);
      return newValue;
    }
    this.target.set(null);
    return null;
  }

  sendOrder(event, target = this.target.get()) {
    if (target !== null) {
      Meteor.call(
        'earth.generalCommand',
        'move',
        target,
        (error) => {
          if (error) {
            Notifications.error('Невозможно отдать приказ', error.error);
          } else {
            // setting Order text to this.order
            this.setOrder();
            Notifications.success(`Приказ отдан: ${this.order.get()}!`);
          }
        },
      );
    }
  }
}

EarthGeneral.register('EarthGeneral');

export default EarthGeneral;
