import { Meteor } from 'meteor/meteor';
import collection from '../lib/collection';

Meteor.publish('containers', function () {
  if (this.userId) {
    return collection.find({
      userId: this.userId,
    });
  }
  return null;
});
