import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import PuzzleCollection from '/imports/modules/Puzzle/lib/PuzzleCollection';
import PuzzleAnswerCollection from '/imports/modules/Puzzle/lib/PuzzleAnswerCollection';
import '../Cells/PuzzleCells';
import PuzzleSolve from '../Solve/PuzzleSolve';
import './PuzzleChat.html';
import './PuzzleChat.styl';

class PuzzleChat extends BlazeComponent {
  template() {
    return 'PuzzleChat';
  }

  constructor({
    hash: {
      id,
    },
  }) {
    super();

    this.puzzleId = id;
    this.cells = new ReactiveVar([]);
    this.opened = new ReactiveVar(0);
    this.isSolved = new ReactiveVar(null);
    this.answers = new ReactiveVar({});
    this.reward = new ReactiveVar(0);

    this.answerHandle = PuzzleAnswerCollection.find({ puzzleId: id }).observeChanges({
      added: (_id, { cells, status }) => {
        this.answers.set(cells);
      },

      changed: (_id, { cells, status }) => {
        this.answers.set(cells);
      },
    });

    const updateValues = (_id, { cells, opened, isSolved, reward }) => {
      if (cells) this.cells.set(cells);
      if (opened) this.opened.set(opened);
      if (isSolved !== undefined) this.isSolved.set(isSolved);
      if (reward) this.reward.set({ credits: reward });
    };

    this.puzzleHandle = PuzzleCollection.find({ _id: id }).observeChanges({
      added: updateValues,
      changed: updateValues,
    });

    this.puzzleSubscription = Meteor.subscribe('puzzle', id);
    this.puzzleAnswerSubscription = Meteor.subscribe('puzzleAnswers', id);
  }

  onDestroyed() {
    super.onDestroyed();

    this.puzzleSubscription.stop();
    this.puzzleAnswerSubscription.stop();
    this.puzzleHandle.stop();
  }

  openSolve(e) {
    e.stopPropagation();
    Game.Popup.show({
      template: (new PuzzleSolve({
        hash: {
          puzzleId: this.puzzleId,
          cells: this.cells,
          answers: this.answers,
        },
      })).renderComponent(),
    });
  }
}

PuzzleChat.register('PuzzleChat');

export default PuzzleChat;
