import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import fs from 'fs';
import { Email } from 'meteor/email';

class ReminderEmails {
  static schedule() {
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
        let path = Assets.absoluteFilePath('reminderEmails/index1.html');
        path = path.substring(0, path.lastIndexOf('/'));
        const templateFilenames = fs.readdirSync(path).filter(filename => filename.substr(-5) === '.html').sort();
        const templates = templateFilenames.map(filename => ({
          from: Meteor.settings.mail.from,
          html: Assets.getText(`reminderEmails/${filename}`),
          attachments: {},
        }));
        const subjectRE = new RegExp('<title>([^<>]+)</title>', 'i');
        const attachmentRE = new RegExp('(\\ssrc=")([^/:"]+)(")', 'gi');
        templates.forEach((template) => {
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
        });

        const inactivityDate = new Date();
        inactivityDate.setDate(inactivityDate.getDate() - 2);
        inactivityDate.setMinutes(inactivityDate.getMinutes() + 1);
        const inactiveUsers = Meteor.users.find({
          emails: { $elemMatch: { unsubscribed: { $ne: true } } },
          'status.online': { $ne: true },
          'status.lastLogout': { $lt: inactivityDate },
          lastReminderDate: { $not: { $gt: inactivityDate } },
          reminderLevel: { $not: { $gte: templates.length } },
        });
        const emailRE = new RegExp('\\{\\{email}}', 'g');
        inactiveUsers.forEach((user) => {
          const reminderLevel = user.reminderLevel ? user.reminderLevel : 0;
          const reminder = { ...templates[reminderLevel], to: user.emails[0].address };
          reminder.html = reminder.html.replace(emailRE, user.emails[0].address);
          Email.send(reminder);
          Meteor.users.update({ _id: user._id }, {
            $set: {
              reminderLevel: reminderLevel + 1,
              lastReminderDate: new Date(),
            },
          });
        });
      },
    });
  }
}

export default ReminderEmails;
