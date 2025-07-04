initCardsLib = function() {
'use strict';

game.Card = function(options) {
  this.doNotRegisterEffect = true;

  game.Card.superclass.constructor.apply(this, arguments);

  this.type = 'card';
  this.cardGroup = options.cardGroup;
  this.cardType = options.cardType;
  this.durationTime = options.durationTime;
  this.reloadTime = options.reloadTime;

  for (var key in Game.Cards.items) {
    if (Game.Cards.items[key][this.engName]) {
      throw new Meteor.Error('Ошибка в контенте', 'Дублируется карточка ' + this.engName);
    }
  }

  this.url = function(options) {
    options = options || {
      group: 'house',
      subgroup: (this.cardType != 'general' ? this.cardType : 'cards'),
      item: this.engName
    };
    return Router.routes.house.path(options);
  };

  this.icon = function() {
    return '/img/game/house/donate/i/' + this.engName + '.png';
  };

  this.image = function() {
    return '/img/game/house/donate/i/' + this.engName + '.png';
  };

  Game.Cards.items[this.cardType][this.engName] = this;

  this.amount = function(options) {
    var cards = Game.Cards.getValue(options);
    return (cards && cards[this.engName] && cards[this.engName].amount)
      ? cards[this.engName].amount
      : 0;
  };

  this.getPrice = function() {
    return options.price;
  };

  this.currentLevel = function() {
    return 0;
  };

  this.getCurrentLevel = this.currentLevel;

  this.getActiveTask = function() {
    return Game.Queue.Collection.findOne(
      {
        user_id: Meteor.userId(),
        status: Game.Queue.status.INCOMPLETE,
        type: 'card',
        engName: this.engName
      },
      { sort: { finishTime: -1 } },
    );
  };

  this.canBuy = function() {
    var price = this.getPrice();
    if (!price) {
      return false;
    }

    var resources = Game.Resources.getValue();
    for (var name in price) {
      if (name != 'time' && resources[name].amount < (price[name])) {
        return false;
      }
    }

    return true;
  };

  this.nextReloadTime = function(options) {
    var cards = Game.Cards.getValue(options);
    if (cards && cards[this.engName] && cards[this.engName].nextReloadTime) {
      return cards[this.engName].nextReloadTime;
    }
    return null;
  };
};
game.extend(game.Card, game.Item);

game.BackRewardCard = function(options) {
  game.BackRewardCard.superclass.constructor.apply(this, arguments);
  this.fromDay = options.fromDay;
  if (options.fromDay < Game.BackRewardCard.MIN_REWARD_DAY) {
    Game.BackRewardCard.MIN_REWARD_DAY = options.fromDay;
  }
};
game.extend(game.BackRewardCard, game.Card);

game.InstantCard = function(options) {
  game.InstantCard.superclass.constructor.apply(this, arguments);

  this.dontNeedResourcesUpdate = true;
  this.durationTime = -1;
};
game.extend(game.InstantCard, game.Card);

Game.Cards = {
  Collection: new Meteor.Collection('cards'),

  items: {
    general: {},
    donate: {},
    pulsecatcher: {},
    penalty: {},
    backReward: {},
    instant: {},
    buff: {},
  },

  getValue: function({
    user,
    userId = user ? user._id : Meteor.userId(),
  } = {}) {
    return Game.Cards.Collection.findOne({
      user_id: userId,
    });
  },

  getActive: function ({
    user,
    userId = user ? user._id : Meteor.userId(),
    timestamp = Game.getCurrentTime(),
  } = {}) {
    var tasks = Game.Queue.Collection.find({
      user_id: userId,
      status: {
        $in: [
          Game.Queue.status.INCOMPLETE,
          Game.Queue.status.INPROGRESS,
        ],
      },
      startTime: { $lt: timestamp },
      finishTime: { $gte: timestamp },
      type: 'card'
    }).fetch();

    var active = {};
    for (var i = 0; i < tasks.length; i++) {
      active[tasks[i].engName] = true;
    }

    var result = [];
    for (var type in Game.Cards.items) {
      for (var name in Game.Cards.items[type]) {
        if (active[name]) {
          result.push(Game.Cards.items[type][name]);
        }
      }
    }
    
    return result;
  },

  hasTypeActive: function({ type, userId = Meteor.userId() }) {
    var tasks = Game.Queue.Collection.find({
      user_id: userId,
      status: Game.Queue.status.INCOMPLETE,
      type: 'card'
    }).fetch();

    var active = {};
    for (var i = 0; i < tasks.length; i++) {
      active[tasks[i].engName] = true;
    }

    for (let name in active) {
      if (Game.Cards.items[type][name]) {
        return true;
      }
    }
    
    return false;
  },

  getItem: function (id) { 
    for (var type in Game.Cards.items) {
      if (Game.Cards.items[type][id]) {
        return Game.Cards.items[type][id];
      }
    }
    return null;
  },

  canUse: function({
    cards,
    ...options
  }) {
    for (let cardId in cards) {
      if (cards.hasOwnProperty(cardId)) {
        let count = cards[cardId];
        let card = Game.Cards.getItem(cardId);
        if (count <= 0 || !card || card.amount(options) < count || !Game.Cards.canActivate({ ...options, card })) {
          return false;
        }
      }
    }

    return true;
  },

  canActivate: function({ card, user, ...options }) {
    if (!card || !user) {
      return false;
    }

    if (card.reloadTime) {
      let nextReloadTime = card.nextReloadTime({ ...options, user });
      if (nextReloadTime > Game.getCurrentTime()) {
        return false;
      }
    }

    return true;
  },

  objectToList: function(obj) {
    let result = [];

    for (let cardId in obj) {
      if (obj.hasOwnProperty(cardId)) {
        let count = obj[cardId];
        let card = Game.Cards.getItem(cardId);

        _.times(count, () => result.push(card));
      }
    }

    return result;
  }
};

Game.BackRewardCard = {
  MIN_REWARD_DAY: Infinity
};

initCardsContent();

};