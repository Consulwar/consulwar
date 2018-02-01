import { Meteor } from 'meteor/meteor';
import collection from './collection';

class User {
  static getById({
    userId = Meteor.userId(),
    user = collection.findOne({ _id: userId }),
  } = {}) {
    return user;
  }

  static getByUsername({
    username,
    user = collection.findOne({ username }),
  } = {}) {
    return user;
  }
}

export default User;
