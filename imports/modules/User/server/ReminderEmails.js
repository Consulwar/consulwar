import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Email } from 'meteor/email';
import { Assets } from '/moduls/game/lib/importCompability';

import './api';

const prepareTemplate = function(filename) {
  const template = {
    from: Meteor.settings.mail.from,
    html: Assets.getText(filename),
    attachments: {},
  };
  const subjectRE = new RegExp('<title>([^<>]+)</title>', 'i');
  const attachmentRE = new RegExp('(\\ssrc=")([^/:"]+)(")', 'gi');
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
  return template;
};

const personalize = function({ template, user }) {
  const emailRE = new RegExp('\\{\\{email}}', 'g');
  const reminder = { ...template, to: user.emails[0].address };
  reminder.html = reminder.html.replace(emailRE, user.emails[0].address);
  return reminder;
};

class ReminderEmails {
  static forceSend({ filename, email }) {
    const template = prepareTemplate(filename);
    Email.send(personalize({ template, user: { emails: [{ address: email }] } }));
  }

  static schedule() {
    if (
      !Meteor.settings.reminderEmails
      || !Meteor.settings.reminderEmails.schedule
      || !Meteor.settings.reminderEmails.intervals
      || !Meteor.settings.reminderEmails.templates
      || !Meteor.settings.reminderEmails.templates.length
    ) {
      throw new Meteor.Error(
        'Ошибка в настройках',
        'Заданы не все настройки напоминаний неактивным игрокам (см. settings.sample reminderEmails)',
      );
    }

    if (Meteor.settings.last) {
      Meteor.users.find({ 'status.online': true }).observe({
        removed({ _id }) {
          Meteor.users.update({ _id }, {
            $set: { 'status.lastLogout': new Date() },
          });
        },
      });
    }

    SyncedCron.add({
      name: 'Рассылка неактивным пользователям',
      schedule: parser => parser.text(Meteor.settings.reminderEmails.schedule),
      job() {
        const templates = Meteor.settings.reminderEmails.templates.map(prepareTemplate);
        const inactivityDate = new Date();
        const INTERVALS = Meteor.settings.reminderEmails.intervals;
        const minimumInterval = Math.min(...INTERVALS);
        inactivityDate.setDate(inactivityDate.getDate() - minimumInterval);
        inactivityDate.setMinutes(inactivityDate.getMinutes() + 1);
        const inactiveUsers = Meteor.users.find({
          emails: { $elemMatch: { unsubscribed: { $ne: true } } },
          'status.online': { $ne: true },
          'status.lastLogout': { $not: { $gt: inactivityDate } },
          lastReminderDate: { $not: { $gt: inactivityDate } },
          reminderLevel: { $not: { $gte: templates.length } },
        });
        inactiveUsers.forEach((user) => {
          const reminderLevel = user.reminderLevel ? user.reminderLevel : 0;
          const userInterval = INTERVALS[Math.min(reminderLevel, INTERVALS.length)];
          const userInactivityDate = new Date();
          userInactivityDate.setDate(userInactivityDate.getDate() - userInterval);
          userInactivityDate.setMinutes(userInactivityDate.getMinutes() + 1);
          if (
            user.emails[0].address
            && (user.status.lastLogout < userInactivityDate || !user.status.lastLogout)
            && (user.lastReminderDate < userInactivityDate || !user.lastReminderDate)
          ) {
            Email.send(personalize({ template: templates[reminderLevel], user }));
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
