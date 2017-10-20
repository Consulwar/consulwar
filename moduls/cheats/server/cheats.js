import Battle from '../../battle/server/battle';
import {
  spawnTradeFleet,
  sendReptileFleetToPlanet,
} from '../../../imports/modules/space/server/actualize';

initCheatsServer = function() {
'use strict';

if (process.env.NODE_ENV == 'development') {

  Meteor.methods({
    'cheats.setUnitCount': function(group, name, count) {
      var set = {};
      set['units.army.' + group + '.' + name] = count; 

      Game.Unit.initialize();
      Game.Unit.Collection.update({
        user_id: Meteor.userId(),
        location: Game.Unit.location.HOME
      }, {
        $set: set
      });

      var homePlanet = Game.Planets.getBase();
      if (homePlanet) {
        // refresh home planet
        homePlanet.timeRespawn = Math.floor( new Date().valueOf() / 1000 );
        Game.Planets.update(homePlanet);
      }
    },

    'cheats.performBattle': function(userArmy, enemyArmy, options) {
      var result = Game.Unit.performBattle(userArmy, enemyArmy, options);
      return result.log;
    },

    'cheats.performBattleRounds': function(count) {
      let battle = Battle.create(
        {
          'tester1': [
            {
              "army": {
                "fleet": {
                  "gammadrone": {
                    "count": 100,
                    "weapon": {
                      "damage": {
                        "min": 552,
                        "max": 575,
                      },
                      "signature": 100,
                    },
                    "health": {
                      "armor": 1008,
                      "signature": 100,
                    },
                  },
                },
              },
            },
          ],
        },
        {
          'ai1': [
            {
              "reptiles": {
                "fleet": {
                  "sphero": {
                    "count": 7,
                    "weapon": {
                      "damage": {
                        "min": 40,
                        "max": 50,
                      },
                      "signature": 100,
                    },
                    "health": {
                      "armor": 150,
                      "signature": 100,
                    },
                  },
                  "blade": {
                    "count": 2,
                    "weapon": {
                      "damage": {
                        "min": 320,
                        "max": 400,
                      },
                      "signature": 100,
                    },
                    "health": {
                      "armor": 700,
                      "signature": 100,
                    },
                  },
                  "trioniks": {
                    "count": 2,
                    "weapon": {
                      "damage": {
                        "min": 80,
                        "max": 100,
                      },
                      "signature": 100,
                    },
                    "health": {
                      "armor": 3500,
                      "signature": 100,
                    },
                  },
                },
              },
            },
          ],
        },
      );

      // Battle.addGroup(battle.id, '1', 'Tester2', {
      //   army: {
      //     fleet: {
      //       gammadrone: {
      //         count: 10,
      //         weapon: {
      //           damage: {min: 80, max: 110},
      //           signature: 100
      //         },
      //         health: {
      //           armor: 200,
      //           signature: 100
      //         }
      //       }
      //     }
      //   }
      // });
      //
      // Battle.addGroup(battle.id, '1', 'dwarf', {
      //   army: {
      //     fleet: {
      //       gammadrone: {
      //         count: 10,
      //         weapon: {
      //           damage: {min: 80, max: 110},
      //           signature: 100
      //         },
      //         health: {
      //           armor: 200,
      //           signature: 100
      //         }
      //       },
      //
      //       wasp: {
      //         count: 10,
      //         weapon: {
      //           damage: {min: 240, max: 300},
      //           signature: 100
      //         },
      //         health: {
      //           armor: 500,
      //           signature: 100
      //         }
      //       }
      //     }
      //   }
      // });

      let options = {
        isEarth: true,
        damageReduction: Game.Earth.DAMAGE_REDUCTION
      };

      battle = Battle.fromDB(battle.id);

      let roundResults = [];

      let round = 1;
      do {
        let roundResult = battle.performEarthRound(options);
        roundResults.push(roundResult);
        round++;
      } while (round <= count);

      return {
        battle,
        roundResults
      };
    },

    'cheats.testMissionGenerate': function (planet) {
      return Game.Planets.generateMission(planet);
    },

    'cheats.spawnTradeFleet': function(hand, segment) {
      spawnTradeFleet(hand, segment);
    },

    'cheats.sendReptileFleetToPlanet': function(planetId) {
      sendReptileFleetToPlanet(planetId);
    },

    'cheats.generateAllPlanets': function() {
      var galactic = Game.Planets.getBase().galactic;
      for (var i = 0; i < galactic.hands; i++) {
        for (var j = 0; j < galactic.segments; j++) {
          Game.Planets.generateSector(galactic, i, j, true);
        }
      }
    },

    'cheats.addResource': function(id, amount) {
      var resources = {};
      resources[id] = amount;
      Game.Resources.add(resources);
    },

    'cheats.spendResource': function(id, amount) {
      var resources = {};
      resources[id] = amount;
      Game.Resources.spend(resources);
    },

    'cheats.addCard': function(id, amount) {
      var cards = {};
      cards[id] = amount;
      Game.Cards.add(cards);
    },

    'cheats.spendCard': function(id, amount) {
      var cards = {};
      cards[id] = amount;
      Game.Cards.spend(cards);
    },

    'cheats.setBuildingLevel': function(group, name, level) {
      Game.Building.add({
        group: group,
        engName: name,
        level: level
      });
    },
    
    'cheats.setResearchLevel': function(group, name, level) {
      Game.Research.add({
        group: group,
        engName: name,
        level: level
      });
    },

    'cheats.setMutualLevel': function(group, name, level) {
      Game.Mutual.initialize(group);
      var set = {};
      set[name] = parseInt(level);
      Game.Mutual.Collection.update({
        group: group
      }, {
        $set: set
      });
    },

    'cheats.resetHouseItems': function() {
      Game.House.initialize(Meteor.user(), true);
    },

    'cheats.buyAllHouseItems': function() {
      var items = {};
      var groups = Game.House.items;
      for (var groupKey in groups) {
        items[groupKey] = {};
        for (var itemKey in groups[groupKey]) {
          items[groupKey][itemKey] = {
            isPlaced: (itemKey == 'consul' ? true : false)
          };
        }
      }
      Game.House.Collection.update({
        user_id: Meteor.userId()
      }, {
        $set: { items: items }
      });
    },

    'cheats.resetQuests': function() {
      Game.Quest.initialize(Meteor.user(), true);
    },

    'cheats.completeQuests': function() {
      var quests = Game.Quest.getValue();
      for (var key in quests.current) {
        quests.current[key].status = Game.Quest.status.FINISHED;
      }
      Game.Quest.Collection.update({ user_id: Meteor.userId() }, quests);
    }
  });

} else {

  var addCheater = function() {
    throw new Meteor.Error('Вы добавлены в список читеров, поздравляем!');
  };

  Meteor.methods({
    'cheats.setUnitCount': addCheater,
    'cheats.performBattle': addCheater,
    'cheats.testMissionGenerate': addCheater,
    'cheats.spawnTradeFleet': addCheater,
    'cheats.sendReptileFleetToPlanet': addCheater,
    'cheats.generateAllPlanets': addCheater,
    'cheats.addResource': addCheater,
    'cheats.spendResource': addCheater,
    'cheats.addCard': addCheater,
    'cheats.spendCard': addCheater,
    'cheats.setBuildingLevel': addCheater,
    'cheats.setResearchLevel': addCheater,
    'cheats.setMutualLevel': addCheater,
    'cheats.resetHouseItems': addCheater,
    'cheats.buyAllHouseItems': addCheater,
    'cheats.resetQuests': addCheater,
    'cheats.completeQuests': addCheater
  });

}

};