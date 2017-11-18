import { Meteor } from 'meteor/meteor';
import LibUser from '../lib/User';

class User extends LibUser {
  static checkAuth({ user }) {
    if (!user || !user._id) {
      throw new Meteor.Error('Требуется авторизация');
    }

    if (user.blocked === true) {
      throw new Meteor.Error('Аккаунт заблокирован');
    }
  }
}

export default User;
