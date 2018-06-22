import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Notifications } from '/moduls/game/lib/importCompability';
import { $ } from 'meteor/jquery';
import './Army/EarthConsulArmy';
import './EarthConsuls.html';
import './EarthConsuls.styl';

class EarthConsuls extends BlazeComponent {
  template() {
    return 'EarthConsuls';
  }

  constructor({
    hash: {
      zone,
      config,
    },
  }) {
    super();

    check(config, ReactiveDict);
    this.config = config;

    this.zone = zone;
    this.generalName = this.zone.general.username;
    this.userName = Meteor.user().username;

    this.isLoading = new ReactiveVar(true);
    this.consuls = new ReactiveVar();
    this.consulName = new ReactiveVar(null);
  }

  onCreated() {
    super.onCreated();

    Meteor.call(
      'earth.getEarthZoneUsers',
      this.zone.name,
      (err, users) => {
        if (err) {
          Notifications.error('Не удалось получить данные о точке', err.error);
        } else {
          this.consuls.set(users);
          this.isLoading.set(false);
        }
      },
    );
  }

  onRendered() {
    super.onRendered();

    $('.cw--EarthConsuls__consuls').perfectScrollbar();
  }

  isGeneral() {
    if (this.generalName === this.userName) {
      return true;
    }
    return false;
  }

  isGeneralCommandTimeExpired(textParam) {
    const { command } = this.zone.general;
    if (command === 'none') {
      return textParam || true;
    }
    return false;
  }

  showConsulArmy(event, name) {
    if (name !== this.consulName.get()) {
      this.consulName.set(name);
      this.config.set('isShowGeneral', false);
    } else {
      // closing EarthConsulArmy
      this.consulName.set(null);
    }
  }

  toggleShowGeneral() {
    if (this.isGeneralCommandTimeExpired()) {
      // dont show window when time is expired (button disabled)
      return;
    }
    // hide Consul Army if exist
    this.consulName.set(null);
    // toggle General
    this.config.set(
      'isShowGeneral',
      !this.config.get('isShowGeneral'),
    );
  }
}

EarthConsuls.register('EarthConsuls');

export default EarthConsuls;
