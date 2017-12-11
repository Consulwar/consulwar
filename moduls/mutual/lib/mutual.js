initMutualLib = function () {
'use strict';

game.MutualItem = function(options) {
  game.MutualItem.superclass.constructor.apply(this, arguments);

  this.constructor = function(options) {
    this.investments = options.investments;
  };

  this.constructor(options);

  this.url = function(options) {
    options = options || {
      group: this.group,
      item: this.engName
    };
    
    return Router.routes[this.type].path(options);
  };

  this.currentLevel = function() {
    return Math.floor(this.currentInvestments() / this.investments);
  };

  this.currentInvestments = function() {
    return Game.Mutual.get({
      group: this.group, 
      engName: this.engName,
    }) || 0;
  };

  this.type = 'mutual';
};
game.extend(game.MutualItem, game.Item);

game.MutualResearch = function(options){
  game.MutualResearch.superclass.constructor.apply(this, arguments);

  if (Game.Mutual.items[this.group][this.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется общее исследование ' + this.engName);
  }

  Game.Mutual.items[this.group][this.engName] = this;

  //this.type = 'MutualResearch';
  this.group = 'research';
};
game.extend(game.MutualResearch, game.MutualItem);

Game.Mutual = {
  Collection: new Meteor.Collection('mutual'),

  getValue: function({ group }) {
    return Game.Mutual.Collection.findOne({ group });
  },

  get: function({ group, engName }) {
    var item = Game.Mutual.getValue({ group });

    if (item && item[engName]) {
      return item[engName];
    } else {
      return 0;
    }
  },

  has: function({ group, name, level, ...options }) {
    level = level || 1;
    if (Game.Mutual.items[group] && Game.Mutual.items[group][name]) {
      return Game.Mutual.items[group][name].currentLevel(options) >= level;
    }
    return false;
  },

  items: {
    research: {},
    council: {}
  }
};

Game.Investments = {
  Collection: new Meteor.Collection('investments'),

  getValue: function(item) {
    return Game.Investments.Collection.findOne({
      user_id: Meteor.userId(),
      group: item.group,
      engName: item.engName
    });
  },

  getTopInvestors: function(item) {
    return Game.Investments.Collection.find({
      group: item.group,
      engName: item.engName
    }, {
      sort: {
        investments: -1
      },
      limit: 5
    });
  },

  items: {}
/*
  get: function(group, name) {
    var item = Game.Mutual.getValue({ group });

    if (item && item[name]) {
      return item[name];
    } else {
      return 0;
    }
  },

  has: function(group, name, level) {
    level = level || 1;
    return Game.Mutual.get({ group, engName: name }) >= level;
  }*/
};

};