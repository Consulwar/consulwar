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
    this.skin = _({ default: { isFree: true } }).extend(skin);
    this.skinCount = _(this.skin).keys().length;
    this.defaultText = defaultText;

    // For legacy
    const idParts = id.split('/');
    this.name = title;
    this.engName = idParts[idParts.length - 1].toLocaleLowerCase();

    if (Game.newToLegacyNames[this.engName]) {
      this.engName = Game.newToLegacyNames[this.engName];
    }

    Game.Persons[this.engName] = this;
    Game.Persons[this.id] = this;
    //
  }

  getFreeSkins() {
    return (
      _(this.skin)
        .chain()
        .keys()
        .filter(key => this.skin[key].isFree === true)
        .value()
    );
  }

  getAvailableSkins({ user = Meteor.user() } = {}) {
    const skins = (
      user
      && user.Person
      && user.Person[this.id]
      && user.Person[this.id].has
    );

    const freeSkins = this.getFreeSkins();

    return (skins && _(freeSkins).union(skins)) || freeSkins;
  }

  getActiveSkins({ user = Meteor.user() } = {}) {
    return (
      user
      && user.Person
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

  getAnimation(skin = this.getCurrentSkin()) {
    return `/img/game/${this.id}/skin/${skin}.webm`;
  }

  getIcon() {
    return `/img/game/${this.id}/icon/default.png`;
  }
}

export default Person;
