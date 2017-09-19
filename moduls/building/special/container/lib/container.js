initBuildingSpecialContainerLib = function() {
'use strict';

game.Container = function(options) {
  // New-to-legacy
  const idParts = options.id.split('/');
  options.name = options.title;
  options.engName = idParts[idParts.length - 1].toLocaleLowerCase();

  if (options.engName == 'small') {
    options.engName = 'defaultContainer';
  }

  if (options.drop) {
    this._drop = options.drop;
    options.drop = [];
    this._drop.forEach((drop) => {
      let profit = { units: { fleet: {} } };
      _(drop.profit).keys().forEach((profitId) => {
        const idParts = profitId.split('/');
        let engName = idParts[idParts.length - 1].toLocaleLowerCase();
        profit.units.fleet[engName] = drop.profit[profitId];
      });
      options.drop.push({
        chance: drop.chance,
        profit,
      });
    })
  }
  //

  if (Game.Building.special.Container.items[options.engName]) {
    throw new Meteor.Error('Ошибка в контенте', 'Дублируется контейнер ' + options.engName);
  }

  Game.Building.special.Container.items[options.engName] = this;

  this.engName = options.engName;
  this.name = options.name;
  this.description = options.description;
  this.price = options.price;
  this.drop = options.drop;

  this.getPrice = function() {
    return Game.Effect.Price.applyTo({ engName: 'containerPrice' }, _.clone(options.price), true);
  };

  this.checkPrice = function() {
    var price = this.getPrice();
    var resources = Game.Resources.getValue();
    for (var name in price) {
      if (name != 'time' && resources[name].amount < (price[name])) {
        return false;
      }
    }
    return true;
  };

  this.amount = function() {
    var items = Game.Building.special.Container.getValue();
    return (items && items[this.engName] && items[this.engName].amount)
      ? items[this.engName].amount
      : 0;
  };

  this.icon = function() {
    return '/img/game/containers/' + this.engName + '.png';
  };

  this.image = function() {
    return '/img/game/containers/' + this.engName + '.jpg';
  };
};

Game.Building.special.Container = {
  Collection: new Meteor.Collection('containers'),

  items: {},

  getValue: function(uid) {
    return Game.Building.special.Container.Collection.findOne({
      user_id: uid === undefined ? Meteor.userId() : uid
    });
  }
};

initBuildingSpecialContainerContent();

};