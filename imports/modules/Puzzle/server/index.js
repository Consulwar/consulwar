import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import collection from '../lib/PuzzleCollection';
import './methods';

Meteor.publish('puzzle', function(puzzleId) {
  check(puzzleId, String);
  if (this.userId) {
    return collection.find({
      _id: puzzleId,
    }, {
      fields: {
        _id: 1,
        reward: 1,
        winner: 1,
      },
    });
  }
  return null;
});
