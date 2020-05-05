import { Meteor } from 'meteor/meteor';
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
import PuzzleInsert from '../Insert/PuzzleInsert';
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
    },
  }) {
    super();

    this.puzzleId = puzzleId;
    this.cells = cells;
    this.answers = answers;
    this.text = new ReactiveVar('…');
    this.selected = null;

    Meteor.call(
      'puzzle.getHints',
      puzzleId,
      (err, result) => this.text.set(result),
    );

    this.plasmoids = PLASMOIDS.map(x => ({ [x.id]: 1 }));
  }

  selectOrb(e, plasmoid) {
    e.originalEvent.dataTransfer.setData('plasmoidId', Object.keys(plasmoid)[0]);
  }

  confirmInsert() {
    return (e, slot) => {
      const plasmoidId = e.originalEvent.dataTransfer.getData('plasmoidId');
      Game.showAcceptWindow(
        `Вставить 1 ${resourceItems[plasmoidId].title} в ${slot}?`,
        () => {
          // Meteor call ACCEPT
          //this.removeComponent();
        },
      );
    };
  }

  openInsertModal() {
    return (e, cell) => {
      if (this.answers.get()[cell]) {
        return;
      }

      Game.Popup.show({
        template: (new PuzzleInsert({
          hash: {
            puzzleId: this.puzzleId,
            slot: cell,
          },
        })).renderComponent(),
      });
    };
  }
}

PuzzleSolve.register('PuzzleSolve');

export default PuzzleSolve;
