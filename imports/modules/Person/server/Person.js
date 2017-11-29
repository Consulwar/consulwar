import { Meteor } from 'meteor/meteor';
import LibPerson from '../lib/Person';

class Person extends LibPerson {
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
