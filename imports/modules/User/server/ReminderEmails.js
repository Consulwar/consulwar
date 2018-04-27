import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import fs from 'fs';
import { Email } from 'meteor/email';
import { Assets } from '/moduls/game/lib/importCompability';

class ReminderEmails {
  static schedule() {
    if (
      !Meteor.settings.reminderEmails
      || !Meteor.settings.reminderEmails.schedule
      || !Meteor.settings.reminderEmails.intervals
    ) {
      throw new Meteor.Error(
        'Ошибка в настройках',
        'Заданы не все настройки напоминаний неактивным игрокам (см. settings.sample reminderEmails)',
      );
    }

    Meteor.users._ensureIndex({
      'emails.address': 1,
    });

    Meteor.users._ensureIndex({
      'emails.unsubscribed': 1,
    });

    Meteor.users._ensureIndex({
      'status.online': 1,
    });

    Meteor.users._ensureIndex({
      'status.lastLogout': 1,
    });

    Meteor.users._ensureIndex({
      lastReminderDate: 1,
    });

    Meteor.users._ensureIndex({
      reminderLevel: 1,
    });

    Meteor.users.find({ 'status.online': true }).observe({
      removed({ _id }) {
        Meteor.users.update({ _id }, {
          $set: { 'status.lastLogout': new Date() },
        });
      },
    });

    SyncedCron.add({
      name: 'Рассылка неактивным пользователям',
      schedule: parser => parser.text(Meteor.settings.reminderEmails.schedule),
      job() {
        // any file that exists there will do
        let path = Assets.absoluteFilePath('reminderEmails/index1.html');
        path = path.substring(0, path.lastIndexOf('/'));
        const templateFilenames = (
          fs
            .readdirSync(path)
            .filter(filename => filename.substr(-5) === '.html')
            .sort()
        );
        const templates = templateFilenames.map(filename => ({
          from: Meteor.settings.mail.from,
          html: Assets.getText(`reminderEmails/${filename}`),
          attachments: {},
        }));
        const subjectRE = new RegExp('<title>([^<>]+)</title>', 'i');
        const attachmentRE = new RegExp('(\\ssrc=")([^/:"]+)(")', 'gi');
        for (let i = 0; i < templates.length; i += 1) {
          const template = templates[i];
          const attachmentsDictionary = {};
          let match;
          do {
            const subjectMatch = subjectRE.exec(template.html);
            template.subject = subjectMatch ? subjectMatch[1] : '';
            match = attachmentRE.exec(template.html);
            if (match) {
              const attachmentFilename = match[2];
              if (!attachmentsDictionary[attachmentFilename]) {
                attachmentsDictionary[attachmentFilename] = {
                  path: Assets.absoluteFilePath(`reminderEmails/${attachmentFilename}`),
                  cid: attachmentFilename,
                };
              }
            }
            template.attachments = Object.values(attachmentsDictionary);
          } while (match);
          template.html = template.html.replace(attachmentRE, '$1cid:$2$3');
        }

        const inactivityDate = new Date();
        const INTERVALS = Meteor.settings.reminderEmails.intervals;
        const minimumInterval = Math.min(...INTERVALS);
        inactivityDate.setDate(inactivityDate.getDate() - minimumInterval);
        inactivityDate.setMinutes(inactivityDate.getMinutes() + 1);
        const inactiveUsers = Meteor.users.find({
          'emails.address': { $exists: true },
          emails: { $elemMatch: { unsubscribed: { $ne: true } } },
          'status.online': { $ne: true },
          'status.lastLogout': { $lt: inactivityDate },
          lastReminderDate: { $not: { $gt: inactivityDate } },
          reminderLevel: { $not: { $gte: templates.length } },
        });
        const emailRE = new RegExp('\\{\\{email}}', 'g');
        inactiveUsers.forEach((user) => {
          const reminderLevel = user.reminderLevel ? user.reminderLevel : 0;
          const userInterval = INTERVALS[Math.min(reminderLevel, INTERVALS.length)];
          const userInactivityDate = new Date();
          userInactivityDate.setDate(userInactivityDate.getDate() - userInterval);
          userInactivityDate.setMinutes(userInactivityDate.getMinutes() + 1);
          if (
            user.status.lastLogout < userInactivityDate
            && (user.lastReminderDate < userInactivityDate || !user.lastReminderDate)
          ) {
            const reminder = { ...templates[reminderLevel], to: user.emails[0].address };
            reminder.html = reminder.html.replace(emailRE, user.emails[0].address);
            Email.send(reminder);
            Meteor.users.update({ _id: user._id }, {
              $set: {
                reminderLevel: reminderLevel + 1,
                lastReminderDate: new Date(),
              },
            });
          }
        });
      },
    });
  }
}

export default ReminderEmails;
