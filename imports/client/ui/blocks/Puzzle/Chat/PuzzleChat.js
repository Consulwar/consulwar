import { Meteor } from 'meteor/meteor';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import PuzzleCollection from '/imports/modules/Puzzle/lib/PuzzleCollection';
import SolutionCollection from '/imports/modules/Puzzle/lib/SolutionCollection';
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
    this.cells = [1, 2, 3, 4, 5, 6, 7, 8];
    this.maxMoves = new ReactiveVar(0);
    this.winner = new ReactiveVar(null);
    this.answers = new ReactiveVar({});
    this.hints = new ReactiveVar(null);
    this.reward = new ReactiveVar(0);
    this.timeout = new ReactiveVar(0);


    const updateAnswers = (_id, { slots, timeout }) => {
      if (slots) this.answers.set(slots);
      if (timeout) this.timeout.set(timeout);
    };
    this.answerHandle = SolutionCollection.find({ puzzleId: id }).observeChanges({
      added: updateAnswers,
      changed: updateAnswers,
    });

    const updateValues = (_id, { maxMoves, winner, reward, answers }) => {
      if (maxMoves) this.maxMoves.set(maxMoves);
      if (winner !== undefined) this.winner.set(winner);
      if (reward) this.reward.set({ credits: reward });
      if (answers) {
        this.puzzleHandle.stop();
        const answersSorted = _.sortBy(answers, 'place');
        answersSorted.unshift(null);
        this.answers.set(answersSorted.map(x => x && x.plasmoid));
        this.hints.set(answersSorted.map(x => x && x.hint));
      }
    };

    this.puzzleHandle = PuzzleCollection.find({ _id: id }).observeChanges({
      added: updateValues,
      changed: updateValues,
    });

    this.puzzleSubscription = Meteor.subscribe('puzzle', id);
    this.puzzleAnswerSubscription = Meteor.subscribe('puzzleSolutions', id);
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
          timeout: this.timeout,
          hints: this.hints,
        },
      })).renderComponent(),
    });
  }
}

PuzzleChat.register('PuzzleChat');

export default PuzzleChat;
