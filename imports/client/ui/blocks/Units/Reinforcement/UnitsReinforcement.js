import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { check } from 'meteor/check';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import humanEarthUnits from '/imports/content/Unit/Human/Ground/client';
import './UnitsReinforcement.html';
import './UnitsReinforcement.styl';

class UnitsReinforcement extends BlazeComponent {
  template() {
    return 'UnitsReinforcement';
  }
  constructor({
    hash: {
      isSelectedAll,
      selectAllUnits,
      selectedUnits,
      activeSquad,
      isSpace,
      colonyId,
      className,
    },
  }) {
    super();

    // temporary selectAll work by ReactiveVar
    this.selectAllUnits = selectAllUnits;

    this.activeSquad = activeSquad;

    check(isSelectedAll, ReactiveVar);
    this.isSelectedAll = isSelectedAll;

    check(selectedUnits, ReactiveVar);
    this.selectedUnits = selectedUnits;
    this.isSpace = isSpace;
    this.colonyId = colonyId;
    this.className = className;
  }

  onCreated() {
    super.onCreated();

    this.colonyCurrent = this.colonyId;

    this.units = this.getUnits();
    if (this.activeSquad) {
      this.setUnits(this.activeSquad.units);
    }
    this.autorun(() => {
      if (this.colonyId && (this.colonyId !== this.colonyCurrent)) {
        this.updateUnits();
      }

      // temporary select All Units by ReactiveVar,
      // cause CosmosAttackMenu has not .childComponents() =(
      if (
        this.selectAllUnits
        && this.selectAllUnits.get() !== this.isSelectedAll.get()
      ) {
        this.toggleSelectAll();
      }
      this.checkSelectedAll();
      this.updateSelectedUnits();
    });
  }

  getUnitCount(unit) {
    if (this.colonyId) {
      return Game.Planets.getFleetUnits(this.colonyId)[unit.id] || 0;
    }
    return unit.getCurrentCount({ from: 'hangar' });
  }

  getUnits() {
    const getUnitsSource = () => {
      if (this.colonyId && this.isSpace) {
        return humanSpaceUnits;
      }
      return humanEarthUnits;
    };

    const unitsSource = getUnitsSource();

    return _.map(unitsSource, (unit, id) => {
      const { title, icon } = unit;
      const max = new ReactiveVar(this.getUnitCount(unit));
      const count = new ReactiveVar(0);

      return {
        id,
        title,
        icon,
        max,
        count,
      };
    });
  }

  setUnits(units) {
    (this.units).forEach((unit) => {
      const countIn = units[unit.id];
      if (countIn > unit.max.get()) {
        unit.count.set(unit.max.get());
      } else {
        unit.count.set(countIn);
      }
    });
  }

  updateUnits() {
    (this.units).forEach((unit) => {
      unit.max.set(this.getUnitCount(unit));
      unit.count.set(0);
    });
  }

  updateSelectedUnits() {
    const units = {};
    (this.units).forEach((unit) => {
      units[unit.id] = unit.count.get();
    });
    this.selectedUnits.set(units);
  }

  toggleMaxCount(event, unit) {
    const max = unit.max.get();
    if (max > 0) {
      const count = unit.count.get();
      if (count < max) {
        unit.count.set(max);
      } else {
        unit.count.set(0);
      }
    }
  }

  checkSelectedAll() {
    let allUnitsCount = 0;
    let selectedUnitsCount = 0;
    (this.units).forEach((unit) => {
      allUnitsCount += unit.max.get();
      selectedUnitsCount += unit.count.get();
    });
    const result = allUnitsCount === selectedUnitsCount;
    this.isSelectedAll.set(result);
    // temporary for space AttackMenu
    if (this.selectAllUnits) {
      this.selectAllUnits.set(result);
    }
  }

  toggleSelectAll() {
    if (!this.isSelectedAll.get()) {
      (this.units).forEach((unit) => {
        unit.count.set(unit.max.get());
      });
    } else {
      (this.units).forEach((unit) => {
        unit.count.set(0);
      });
    }
  }
}

UnitsReinforcement.register('UnitsReinforcement');

export default UnitsReinforcement;
