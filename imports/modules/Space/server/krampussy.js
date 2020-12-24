import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { _ } from 'meteor/underscore';
import Reptiles from './reptiles';

if (
  !Meteor.settings.space.krampussy
  || !Meteor.settings.space.krampussy.schedule
  || !Meteor.settings.space.krampussy.rewards
) {
  throw new Meteor.Error(
    'Ошибка в настройках',
    'Заданы не все настройки события крампусси (см. settings.sample space.krampussy)',
  );
}

if (Meteor.settings.last) {
  SyncedCron.add({
    name: 'Спаун крампусси',
    schedule: parser => parser.text(Meteor.settings.space.krampussy.schedule),
    job() {
      Reptiles.spawnKrampussyFleet();
    },
  });
}
