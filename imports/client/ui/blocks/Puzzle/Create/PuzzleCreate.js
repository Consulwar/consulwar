import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import SilverPlasmoid from '/imports/content/Resource/Artifact/White/client/SilverPlasmoid';
import EmeraldPlasmoid from '/imports/content/Resource/Artifact/Green/client/EmeraldPlasmoid';
import SapphirePlasmoid from '/imports/content/Resource/Artifact/Blue/client/SapphirePlasmoid';
import AmethystPlasmoid from '/imports/content/Resource/Artifact/Purple/client/AmethystPlasmoid';
import TopazPlasmoid from '/imports/content/Resource/Artifact/Orange/client/TopazPlasmoid';
import RubyPlasmoid from '/imports/content/Resource/Artifact/Red/client/RubyPlasmoid';
import './PuzzleCreate.html';
import './PuzzleCreate.styl';

const PLASMOIDS = [
  SilverPlasmoid,
  EmeraldPlasmoid,
  SapphirePlasmoid,
  AmethystPlasmoid,
  TopazPlasmoid,
  RubyPlasmoid,
];

class PuzzleCreate extends BlazeComponent {
  template() {
    return 'PuzzleCreate';
  }

  constructor() {
    super();

    this.plasmoids = PLASMOIDS;
    const plasmoidIds = PLASMOIDS.map(x => x.id);
    this.possiblePlace = [1, 2, 3, 4, 5, 6, 7, 8];

    this.reward = new ReactiveVar(100);

    const place = _.shuffle(this.possiblePlace);
    this.sequence = Array(8).fill(null).map(() => ({
      place: new ReactiveVar(place.pop()),
      plasmoid: new ReactiveVar(Game.Random.fromArray(plasmoidIds)),
      hint: new ReactiveVar(''),
      text: '',
    }));
  }

  price() {
    return { 'Resource/Base/Credit': 500 + this.reward.get() };
  }

  isPlaceSelected(cell, place) {
    if (cell.place.get() === place) {
      return 'selected';
    }
    return '';
  }

  isPlasmoidSelected(cell, plasmoid) {
    if (cell.plasmoid.get() === plasmoid.id) {
      return 'selected';
    }
    return '';
  }

  createPuzzle(e) {
    e.preventDefault();

    Game.showAcceptWindow(
      `Создать пазл с наградой ${this.reward.get()}?`,
      () => {
        Meteor.call(
          'puzzle.create',
          {
            reward: this.reward.get(),
            sequence: this.sequence.map(x => ({
              place: x.place.get(),
              plasmoid: x.plasmoid.get(),
              hint: x.hint.get(),
              text: '',
            })),
          },
          (error) => {
            if (error) {
              Notifications.error(
                'Неудалось создать пазл',
                error.error
              );
            } else {
              this.removeComponent();
            }
          }
        );
      },
    );
  }
}

PuzzleCreate.register('PuzzleCreate');

export default PuzzleCreate;
