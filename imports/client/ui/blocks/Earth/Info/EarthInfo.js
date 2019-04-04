import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import '/imports/client/ui/button/button.styl';
import '../Battle/EarthBattle';
import '../Consuls/EarthConsuls';
import '../General/EarthGeneral';
import '../Order/EarthOrder';
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

    this.zone = Game.EarthZones.getByName(this.name);
    this.userZone = Game.EarthUnits.get();

    this.userName = Meteor.user().username;

    this.configEarthInfo = new ReactiveDict();
    this.configEarthInfo.set('isShowReinforcement', false);
    this.configEarthInfo.set('isShowConsuls', false);
    this.configEarthInfo.set('isShowGeneral', false);
  }

  hasNotArmy() {
    return this.userZone === undefined;
  }

  isUserArmyLocation(zoneName = this.zone.name) {
    return this.userZone
      && this.userZone.zoneName === zoneName;
  }

  isUserGeneral() {
    if (
      this.zone.general
      && this.userName === this.zone.general.username
    ) {
      return true;
    }
    return false;
  }

  isEnemy(zone = this.zone) {
    return zone.isEnemy && zone.usersCount === 0;
  }

  isBattle(zone = this.zone) {
    // both army in zone == war?
    // do we need checking battleId?
    return zone.enemyArmy && zone.userArmy;
  }

  formatUnits(source) {
    // format units to space style
    // source = { id: count, ... }
    return _.map(source, (count, id) => ({ id, count }));
  }

  getUnits() {
    let source = null;
    if (this.isEnemy()) {
      source = this.zone.enemyArmy;
    } else {
      source = this.zone.userArmy;
    }
    return this.formatUnits(source);
  }

  isNotFightingNow() {
    const userArmyZone = Game.EarthZones.getByName(this.userZone.zoneName);

    return !(userArmyZone.enemyArmy && userArmyZone.userArmy);
  }

  getUserArmy() {
    if (this.isUserArmyLocation()) {
      return this.formatUnits(this.userZone.userArmy);
    }
    return null;
  }

  zoneBonus(zone = this.zone) {
    if (!zone.bonus) {
      return false;
    }
    const { id, count, min = 0 } = zone.bonus;

    const bonusObj = {};
    const keys = id.split('.');
    const lastKey = keys.pop();
    let curObj = bonusObj;
    keys.forEach((key) => {
      curObj[key] = {};
      curObj = curObj[key];
    });
    curObj[lastKey] = count;

    const { title, color } = Game.getObjectByPath(bonusObj);

    let countPerConsul = 0;
    if (zone.usersCount) {
      countPerConsul = Math.max(Math.floor(count / zone.usersCount), min);
    }

    return {
      title,
      color,
      count: Math.max(count, min),
      min,
      countPerConsul,
    };
  }

  hasLink() {
    if (this.userZone) {
      const userArmyZone = Game.EarthZones.getByName(this.userZone.zoneName);

      return userArmyZone.links.indexOf(this.name) !== -1;
    }

    return false;
  }

  move() {
    Meteor.call(
      'earth.moveArmy',
      this.name,
      (error) => {
        if (error) {
          Notifications.error('Перемещение невозможно', error.error);
        } else {
          Notifications.success(`Ваши войска выдвинулись в ${this.name}`);
        }
      },
    );
  }

  toggleReinforcement() {
    this.configEarthInfo.set(
      'isShowReinforcement',
      !this.configEarthInfo.get('isShowReinforcement'),
    );
  }

  toggleConsuls() {
    this.configEarthInfo.set(
      'isShowConsuls',
      !this.configEarthInfo.get('isShowConsuls'),
    );
  }

  showAdmin() {
    Game.Popup.show({
      templateName: 'adminReptileChange',
      data: {
        zoneName: this.zone.name,
      },
    });
  }

  closeWindow() {
    this.removeComponent();
  }
}

EarthInfo.register('EarthInfo');

export default EarthInfo;
