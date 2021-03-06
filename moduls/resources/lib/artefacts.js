import { default as Game, game } from '/moduls/game/lib/main.game';

game.Artefact = function(options) {
  this.id = options.id;
  this.title = options.title;
  const idParts = options.id.split('/');
  // New-to-legacy
  options.name = options.title;

  options.group = idParts[2].toLocaleLowerCase();
  options.engName = idParts[3].toLocaleLowerCase();

  if (Game.newToLegacyNames[options.engName]) {
    options.engName = Game.newToLegacyNames[options.engName];
  }

  if (Game.newToLegacyNames[options.group]) {
    options.group = Game.newToLegacyNames[options.group];
  }
  //
  switch (idParts[2]) {
    case 'Green':
      this.color = 'cw--color_credit';
      break;
    case 'Blue':
      this.color = 'cw--color_metal';
      break;
    case 'Purple':
      this.color = 'cw--color_crystal';
      break;
    case 'Orange':
      this.color = 'cw--color_human';
      break;
    case 'Red':
      this.color = 'cw--color_honor';
      break;

    default:
      this.color = 'cw--color_white';
      break;
  }

  this.group = options.group;
  this.engName = options.engName;
  this.name = options.name;
  this.description = options.description;

  this.type = 'artefact';

  this.amount = function() {
    var resources = Game.Resources.getValue();
    return (resources && resources[this.engName] && resources[this.engName].amount)
      ? resources[this.engName].amount
      : 0;
  };

  this.getCurrentCount = this.amount;

  this.has = ({ count = 1, ...options } = {}) => {
    return this.getCurrentCount(options) >= count;
  }

  if (Game.Artefacts.items[options.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется артефакт ' + options.engName);
  }

  this.meetRequirements = function() {
    return true;
  };

  this.isEnoughResources = function() {
    return true;
  };


  this.path = '/img/game/artefact/';

  this.icon = `${this.path}${this.group}/i/${this.engName}.png`;
  this.card = `${this.path}${this.group}/${this.engName}/item.jpg`;
  this.overlayOwn = this.card;

  this.url = function(options) {
    options = options || {
      item: this.engName
    };
    return Router.routes.artefacts.path(options);
  };

  Game.Artefacts.items[options.engName] = this;

  // new
  this.add = ({ count, userId }) => {
    Game.Resources.add({
      [this.engName]: count,
    }, userId);
  };
  //
};

Game.Artefacts = {
  items: {},
};

const Artifact = game.Artefact;

export default Artifact;
