initArtefactsLib = function() {
'use strict';

game.Artefact = function(options) {
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