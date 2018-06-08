import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import { Command, ResponseToGeneral } from '/moduls/earth/lib/generals';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import '../Battle/EarthBattle';
import '../Army/EarthArmy';
import '../Reinforcement/EarthReinforcement';
import './EarthInfo.html';
import './EarthInfo.styl';

class EarthInfo extends BlazeComponent {
  template() {
    return 'EarthInfo';
  }

  constructor({
    hash: {
      name,
      position,
    },
  }) {
    super();

    this.position = position;
    this.name = name;
  }

  onCreated() {
    super.onCreated();

    this.zone = Game.EarthZones.getByName(this.name);
    this.userZone = Game.EarthUnits.get();
    this.isShowingReinforcement = new ReactiveVar(false);
    console.log('userZone', this.userZone);
    console.log('zone', this.zone);
  }

  isUserArmyLocation(zoneName = this.zone.name) {
    return this.userZone
      && this.userZone.zoneName === zoneName;
  }
  isEnemy() {
    return this.zone.isEnemy && this.zone.usersCount === 0;
  }
  isBattle(zone = this.zone) {
    // both army in zone
    return zone.enemyArmy && zone.userArmy;
  }

  isNotFightingNow() {
    const userArmyZone = Game.EarthZones.getByName(this.userZone.zoneName);

    return !(userArmyZone.enemyArmy && userArmyZone.userArmy);
  }

  getUserArmy() {
    if (this.isUserArmyLocation()) {
      return this.userZone.userArmy;
    }
    return {};
  }

  zoneBonus() {
    if (!this.zone.bonus) {
      return false;
    }
    const { id, count } = this.zone.bonus;

    const bonusObj = {};
    const keys = id.split('.');
    const lastKey = keys.pop();
    let curObj = bonusObj;
    keys.forEach((key) => {
      curObj[key] = {};
      curObj = curObj[key];
    });
    curObj[lastKey] = count;

    const { title } = Game.getObjectByPath(bonusObj);

    let countPerConsul = 0;
    if (this.zone.usersCount) {
      countPerConsul = Math.floor(count / this.zone.usersCount);
    }

    return {
      title,
      count,
      countPerConsul,
    };
  }

  // armyZone() = this.userZone;

  hasLink() {
    if (this.userZone) {
      const userArmyZone = Game.EarthZones.getByName(this.userZone.zoneName);

      return userArmyZone.links.indexOf(this.name) !== -1;
    }

    return false;
  }

  move() {
    Meteor.call('earth.moveArmy', this.name);
  }

  ResponseToGeneral() {
    return ResponseToGeneral;
  }

  Command() {
    return Command;
  }

  orderResponse(event, answer = true) {
    Meteor.call('earth.responseToGeneral', answer);
  }

  toggleReinforcement(event) {
    this.isShowingReinforcement.set(!this.isShowingReinforcement.get());
  }

  showAdmin(event) {
    Game.Popup.show({
      templateName: 'adminReptileChange',
      data: {
        zoneName: this.zone.name,
      },
    });
  }

  closeWindow(event) {
    this.removeComponent();
  }
}

EarthInfo.register('EarthInfo');

export default EarthInfo;
