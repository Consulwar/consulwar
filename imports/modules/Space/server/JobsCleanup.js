import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import Space from '../lib/space';

class JobsCleanup {
  static schedule() {
    if (
      !Meteor.settings.space.jobs.cleanup
      || !Meteor.settings.space.jobs.cleanup.schedule
      || !Meteor.settings.space.jobs.cleanup.maxAge
    ) {
      throw new Meteor.Error(
        'Ошибка в настройках',
        'Заданы не все настройки чистки задач (см. settings.sample space.jobs.cleanup)',
      );
    }

    SyncedCron.add({
      name: 'Чистка задач',
      schedule: parser => parser.text(Meteor.settings.space.jobs.cleanup.schedule),
      job() {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - Meteor.settings.space.jobs.cleanup.maxAge);
        // eslint-disable-next-line no-console
        console.log(`Удаляем задачи старше ${minDate}`);
        const removedJobs = Space.collection.remove({
          status: { $in: ['completed', 'cancelled'] },
          after: { $lt: minDate },
        });
        // eslint-disable-next-line no-console
        console.log(`Почистили ${removedJobs} задач`);
      },
    });
  }
}

export default JobsCleanup;
