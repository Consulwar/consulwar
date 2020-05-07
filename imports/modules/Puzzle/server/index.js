import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import PuzzleCollection from '../lib/PuzzleCollection';
import SolutionCollection from '../lib/SolutionCollection';
import './methods';

SolutionCollection._ensureIndex({
  puzzleId: 1,
  userId: 1,
});

Meteor.publish('puzzle', function(puzzleId) {
  check(puzzleId, String);
  if (this.userId) {
    return PuzzleCollection.find({
      _id: puzzleId,
    }, {
      fields: {
        _id: 1,
        reward: 1,
        maxMoves: 1,
        winner: 1,
      },
    });
  }
  return null;
});

Meteor.publish('puzzleSolutions', function(puzzleId) {
  check(puzzleId, String);
  if (this.userId) {
    return SolutionCollection.find({
      puzzleId,
      userId: this.userId,
    });
  }
  return null;
});
