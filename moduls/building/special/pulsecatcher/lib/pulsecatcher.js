let PulseCatcher;
if (Meteor.isClient) {
  PulseCatcher = require('/imports/content/Building/Residential/client/PulseCatcher').default;
} else {
  PulseCatcher = require('/imports/content/Building/Residential/server/PulseCatcher').default;
}

initBuildingSpecialPulsecatcherLib = function() {
'use strict';

Game.Building.special.Pulsecatcher = {
  getQuiz: function(skip = 0) {
    return Game.Quiz.Collection.findOne({
      type: 'pulsecatcher'
    }, {
      sort: { endDate: -1 },
      skip: skip
    });
  },

  getChoosenBonus: function(previousQuiz = Game.Building.special.Pulsecatcher.getQuiz(1)) {
    if (!previousQuiz) {
      return null;
    }

    var choosen = null;
    for (var key in previousQuiz.result) {
      if (choosen === null || previousQuiz.result[key] > previousQuiz.result[choosen]) {
        choosen = key;
      }
    }

    return Game.Cards.items.pulsecatcher[choosen] ? Game.Cards.items.pulsecatcher[choosen] : null;
  },

  canActivate: function() {
    var level = PulseCatcher.getCurrentLevel();

    if (!level) {
      return false;
    }

    var previousQuiz = Game.Building.special.Pulsecatcher.getQuiz(1);
    var card = Game.Building.special.Pulsecatcher.getChoosenBonus(previousQuiz);

    if (!card) {
      return false;
    }

    var activeList = Game.Building.special.Pulsecatcher.getActiveBonusList();

    var canActivate = (
         activeList 
      && card 
      && (!activeList[card.engName]
        || (
             activeList[card.engName] 
          && activeList[card.engName].getActiveTask().startTime < previousQuiz.endDate
        )
      )
    );

    return (canActivate
      ? card
      : false
    );
  },

  getActiveBonusList: function() {
    var result = {};
    for (var key in Game.Cards.items.pulsecatcher) {
      if (Game.Cards.items.pulsecatcher[key].cardType == 'pulsecatcher'
       && Game.Cards.items.pulsecatcher[key].getActiveTask()
      ) {
        result[key] = Game.Cards.items.pulsecatcher[key];
      }
    }
    return result;
  }
};

initBuildingSpecialPulsecatcherConfigLib();

};