import { Meteor } from 'meteor/meteor';
import libPerson from '../lib/Person';

class Person extends libPerson {
  addSkin({
    id,
    user = Meteor.user(),
  }) {
    Meteor.users.update({
      _id: user._id,
    }, {
      $addToSet: {
        [`Person.${this.id}.has`]: id,
      },
    });
  }

  activateSkins({
    ids,
    user = Meteor.user(),
  }) {
    Meteor.users.update({
      _id: user._id,
    }, {
      $set: {
        [`Person.${this.id}.active`]: ids.length ? ids : ['default'],
      },
    });
  }
}

export default Person;
