import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';
import './EarthConsulArmy.html';
import './EarthConsulArmy.styl';

class EarthConsulArmy extends BlazeComponent {
  template() {
    return 'EarthConsulArmy';
  }

  constructor({
    hash: {
      consulName,
    },
  }) {
    super();

    check(consulName, ReactiveVar);
    this.consulName = consulName;
  }

  onCreated() {
    super.onCreated();

    this.isLoading = new ReactiveVar(true);
    this.consulArmy = new ReactiveVar();

    this.autorun(() => {
      this.getConsulArmy(this.consulName.get());
    });
  }

  getConsulArmy(userName) {
    this.isLoading.set(true);
    Meteor.call(
      'earth.getEarthUnits',
      userName,
      (err, army) => {
        if (err) {
          Notification.error('Не удалось получить состав армии консула', err.error);
        } else {
          this.isLoading.set(false);
          this.consulArmy.set(army);
        }
      },
    );
  }
}

EarthConsulArmy.register('EarthConsulArmy');

export default EarthConsulArmy;
