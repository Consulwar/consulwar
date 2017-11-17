import { Meteor } from 'meteor/meteor';
import libPerson from '../lib/Person';

class Person extends libPerson {
  addSkin({
    id,
    userId = Meteor.userId(),
  }) {
    Meteor.users.update({
      _id: userId,
    }, {
      $addToSet: {
        [`Person.${this.id}.has`]: id,
      },
    });
  }

  activateSkins({
    ids,
    userId = Meteor.userId(),
  }) {
    Meteor.users.update({
      _id: userId,
    }, {
      $set: {
        [`Person.${this.id}.active`]: ids.length ? ids : ['default'],
      },
    });
  }
}

export default Person;
