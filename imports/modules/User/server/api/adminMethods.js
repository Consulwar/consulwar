import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import User from '/imports/modules/User/server/User';
import Log from '/imports/modules/Log/server/Log';
import ReminderEmails from '../ReminderEmails';

Meteor.methods({
  'user.sendReminder'({ filename, email }) {
    const user = User.getById();
    User.checkAuth({ user });

    Log.method.call(this, { name: 'user.sendReminder', user });

    const isAdmin = ['admin'].indexOf(user.role) >= 0;
    if (!isAdmin) {
      throw new Meteor.Error('Нужны права администратора');
    }

    check(filename, String);
    check(email, String);

    ReminderEmails.forceSend({ filename, email });
  },
});
