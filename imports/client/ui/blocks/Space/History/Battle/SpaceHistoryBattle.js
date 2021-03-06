import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import '/imports/client/ui/blocks/Units/Power/UnitsPower';
import '/imports/client/ui/blocks/Units/Units';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import './SpaceHistoryBattle.html';
import './SpaceHistoryBattle.styl';

class SpaceHistoryBattle extends BlazeComponent {
  template() {
    return 'SpaceHistoryBattle';
  }

  constructor({
    hash: {
      battle,
    },
  }) {
    super();

    this.battle = battle;
  }

  onCreated() {
    super.onCreated();

    this.mainUserName = Meteor.user().username;
    this.user = new ReactiveVar(this.mainUserName);
    this.squad = new ReactiveVar(0);
    this.hasEnemyLosts = new ReactiveVar(false);
    this.hasUserLosts = new ReactiveVar(false);
  }

  getIsReptiles() {
    if (this.battle.mission === "Крампус 1") {
      return { name: 'Крампус' };
    }
    if (this.battle.mission === "Крампусси 1") {
      return { name: 'Крампусси' };
    }
    return true;
  }

  isSpace() {
    return !this.battle.isEarth;
  }

  getUsers() {
    return _.keys(this.battle.users);
  }

  isMainUser(userName) {
    return userName === this.mainUserName;
  }

  hasUsers() {
    return this.getUsers().length > 1;
  }

  hasSquads(userName = this.user.get()) {
    return this.battle.users[userName].squads.length > 1;
  }

  getSquads(userName = this.user.get()) {
    const result = [];
    const { squads } = this.battle.users[userName];
    squads.forEach((squad, i) => {
      if (i === 0) {
        result.push('Все отряды');
      } else {
        result.push(`Отряд ${i}`);
      }
    });
    return result;
  }

  getUserReward() {
    return this.battle.users[this.user.get()].reward;
  }

  getUserCosts() {
    return this.battle.users[this.user.get()].lostUnitsPrice;
  }

  getUnits(unitsType, isDiff = false) {
    let units;
    if (unitsType === 'userUnits') {
      units = this.battle.users[this.user.get()].squads[this.squad.get()];
    } else {
      units = this.battle[unitsType];
    }
    const resultUnits = [];

    units.forEach((unit) => {
      let count = unit.start;
      if (isDiff === true) {
        count = unit.end - unit.start;
      }
      if (count !== 0) {
        resultUnits.push({
          id: unit.id,
          count,
        });
      }
    });
    if (resultUnits.length <= 0) {
      if (unitsType === 'userUnits' && isDiff) {
        this.hasUserLosts.set(false);
      } else if (isDiff) {
        this.hasEnemyLosts.set(false);
      }
      return false;
    }
    if (unitsType === 'userUnits' && isDiff) {
      this.hasUserLosts.set(true);
    } else if (isDiff) {
      this.hasEnemyLosts.set(true);
    }
    return resultUnits;
  }

  getUserPower() {
    return this.battle.users[this.user.get()].power;
  }

  getRawUnits(unitsType) {
    // for calculate Power
    let units;
    if (unitsType === 'userUnits') {
      units = this.battle.users[this.user.get()].squads[this.squad.get()];
    } else {
      units = this.battle[unitsType];
    }
    const result = {};

    units.forEach((unit) => {
      result[unit.id] = unit.start;
    });
    return result;
  }

  switchUser({ currentTarget }) {
    this.user.set(currentTarget.value);
    this.squad.set(0);
  }
  switchSquad({ currentTarget }) {
    this.squad.set(currentTarget.value);
  }
}

SpaceHistoryBattle.register('SpaceHistoryBattle');

export default SpaceHistoryBattle;
