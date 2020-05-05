import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import Game from '/moduls/game/lib/main.game';
import SilverPlasmoid from '/imports/content/Resource/Artifact/White/client/SilverPlasmoid';
import EmeraldPlasmoid from '/imports/content/Resource/Artifact/Green/client/EmeraldPlasmoid';
import SapphirePlasmoid from '/imports/content/Resource/Artifact/Blue/client/SapphirePlasmoid';
import AmethystPlasmoid from '/imports/content/Resource/Artifact/Purple/client/AmethystPlasmoid';
import TopazPlasmoid from '/imports/content/Resource/Artifact/Orange/client/TopazPlasmoid';
import RubyPlasmoid from '/imports/content/Resource/Artifact/Red/client/RubyPlasmoid';
import './PuzzleInsert.html';
import './PuzzleInsert.styl';


const PLASMOIDS = [
  SilverPlasmoid,
  EmeraldPlasmoid,
  SapphirePlasmoid,
  AmethystPlasmoid,
  TopazPlasmoid,
  RubyPlasmoid,
];

class PuzzleInsert extends BlazeComponent {
  template() {
    return 'PuzzleInsert';
  }

  constructor({
    hash: {
      puzzleId,
      slot,
    },
  }) {
    super();
    this.puzzleId = puzzleId;
    this.slot = slot;

    this.PLASMOIDS = PLASMOIDS;
  }

  selectResource() {
    return (e, resource) => {
      Game.showAcceptWindow(
        `Вставить 1 ${resource.title} в ${this.slot}?`,
        () => {
          // Meteor call ACCEPT
          this.removeComponent();
        },
      );
    };
  }
}

PuzzleInsert.register('PuzzleInsert');

export default PuzzleInsert;
