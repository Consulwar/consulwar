initMailQuizLib = function () {
'use strict';

Game.Quiz = {
  Collection: new Meteor.Collection('quiz'),

  Answer: {
    Collection: new Meteor.Collection('quiz_answer')
  },

  getValue: function(id) {
    return Game.Quiz.Collection.findOne({
      _id: id
    });
  },

  items: {}
};

};