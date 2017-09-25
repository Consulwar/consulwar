initArtefactsLib = function() {
'use strict';

game.Artefact = function(options) {
  // New-to-legacy
  const idParts = options.id.split('/');
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

  if (Game.Artefacts.items[options.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется артефакт ' + options.engName);
  }

  this.meetRequirements = function() {
    return true;
  };

  this.isEnoughResources = function() {
    return true;
  };

  this.url = function(options) {
    options = options || {
      item: this.engName
    };
    return Router.routes.artefacts.path(options);
  };
  
  this.getOverlayOwn = function() {
    return `/img/game/${this.type}/${this.group}/${this.engName}/item.jpg`;
  };

  this.icon = function() {
    return '/img/game/artefact/' + this.group + '/i/' + this.engName + '.png';
  };

  this.image = function() {
    return '/img/game/artefact/' + this.group + '/' + this.engName + '/item.jpg';
  };

  Game.Artefacts.items[options.engName] = this;
};

Game.Artefacts = {
  items: {}
};

initArtefactsContent();
};