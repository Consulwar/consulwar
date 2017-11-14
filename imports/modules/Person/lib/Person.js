import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import Game from '/moduls/game/lib/main.game';

class Person {
  constructor({
    id,
    title,
    skin = {},
    defaultText = '',
  }) {
    this.id = id;
    this.title = title;
    this.skin = _({ default: {} }).extend(skin);
    this.skinCount = _(skin).keys().length;
    this.defaultText = defaultText;

    // For legacy
    const idParts = id.split('/');
    this.name = title;
    this.engName = idParts[idParts.length - 1].toLocaleLowerCase();

    if (Game.newToLegacyNames[this.engName]) {
      this.engName = Game.newToLegacyNames[this.engName];
    }

    Game.Persons[this.engName] = this;
    //
  }

  getAvailableSkins({ user = Meteor.user() } = {}) {
    const skins = (
      user.Person
      && user.Person[this.id]
      && user.Person[this.id].has
    );

    return (skins && _(['default']).union(skins)) || ['default'];
  }

  getActiveSkins({ user = Meteor.user() } = {}) {
    return (
      user.Person
      && user.Person[this.id]
      && user.Person[this.id].active
    ) || ['default'];
  }

  getCurrentSkin({ user = Meteor.user() } = {}) {
    const activeSkins = this.getActiveSkins({ user });
    if (Game.Settings.getOption({ user, name: 'isMultiSkinEnabled' })) {
      return Game.Random.fromArray(activeSkins);
    }
    return activeSkins[0];
  }

  getImage(skin = this.getCurrentSkin()) {
    return `/img/game/${this.id}/skin/${skin}.jpg`;
  }

  getIcon() {
    return `/img/game/${this.id}/icon/default.png`;
  }
}

export default Person;
