import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PuzzleCollection from '../lib/PuzzleCollection';
import PuzzleAnswerCollection from '../lib/PuzzleAnswerCollection';

Meteor.publish('puzzle', function(id) {
  check(id, String);
  
  if (this.userId) {
    return PuzzleCollection.find({
      _id: id,
    });
  }
  return null;
});

Meteor.publish('puzzleAnswers', function(puzzleId) {
  check(puzzleId, String);

  if (this.userId) {
    return PuzzleAnswerCollection.find({
      userId: this.userId,
      puzzleId,
    });
  }
  return null;
});
