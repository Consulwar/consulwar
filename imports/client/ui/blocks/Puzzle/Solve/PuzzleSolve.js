import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import SilverPlasmoid from '/imports/content/Resource/Artifact/White/client/SilverPlasmoid';
import EmeraldPlasmoid from '/imports/content/Resource/Artifact/Green/client/EmeraldPlasmoid';
import SapphirePlasmoid from '/imports/content/Resource/Artifact/Blue/client/SapphirePlasmoid';
import AmethystPlasmoid from '/imports/content/Resource/Artifact/Purple/client/AmethystPlasmoid';
import TopazPlasmoid from '/imports/content/Resource/Artifact/Orange/client/TopazPlasmoid';
import RubyPlasmoid from '/imports/content/Resource/Artifact/Red/client/RubyPlasmoid';
import resourceItems from '/imports/content/Resource/client';
import './PuzzleSolve.html';
import './PuzzleSolve.styl';

const PLASMOIDS = [
  SilverPlasmoid,
  EmeraldPlasmoid,
  SapphirePlasmoid,
  AmethystPlasmoid,
  TopazPlasmoid,
  RubyPlasmoid,
];

class PuzzleSolve extends BlazeComponent {
  template() {
    return 'PuzzleSolve';
  }

  constructor({
    hash: {
      puzzleId,
      cells,
      answers,
      hints,
      timeout,
    },
  }) {
    super();

    this.puzzleId = puzzleId;
    this.cells = cells;
    this.answers = answers;
    this.hints = hints;
    this.text = new ReactiveVar('…');
    this.timeout = timeout;

    this.hintUpdater = Tracker.autorun((calc) => {
      if (this.hints.get()) {
        calc.stop();
        this.text.set('Нажмите на шар что бы увидеть соответствующую подсказку');
        return;
      }
      this.answers.get(); // for reactivity
      Meteor.call(
        'puzzle.getHints',
        { puzzleId },
        (err, result) => this.text.set(result[result.length - 1].hint),
      );
    });

    this.plasmoids = PLASMOIDS.map(x => ({ [x.id]: 1 }));
  }

  onDestroyed() {
    super.onDestroyed();

    this.hintUpdater.stop();
  }

  selectOrb(e, plasmoid) {
    e.originalEvent.dataTransfer.setData('plasmoidId', Object.keys(plasmoid)[0]);
  }

  showHint() {
    return (e, slot) => {
      if (this.hints.get()) {
        this.text.set(this.hints.get()[slot]);
      }
    };
  }

  confirmInsert() {
    return (e, slot) => {
      const plasmoidId = e.originalEvent.dataTransfer.getData('plasmoidId');
      Game.showAcceptWindow(
        `Вставить 1 ${resourceItems[plasmoidId].title} в ${slot}?`,
        () => {
          Meteor.call(
            'puzzle.insert',
            {
              puzzleId: this.puzzleId,
              place: slot,
              plasmoid: plasmoidId,
            },
          );
        },
      );
    };
  }
}

PuzzleSolve.register('PuzzleSolve');

export default PuzzleSolve;
