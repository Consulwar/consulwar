import Battle from '../../battle/server/battle';

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
        'Zav', {
          "army" : {
            "ground" : {
              "horizontalbarman" : {
                "count" : 1277659,
                "weapon" : {
                  "damage" : {
                    "min" : 27,
                    "max" : 34
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 16,
                  "signature" : 100
                }
              }
            }
          }
        },
        'ai1', {
          "reptiles" : {
            "ground" : {
              "striker" : {
                "count" : 146822,
                "weapon" : {
                  "damage" : {
                    "min" : 11,
                    "max" : 14
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 35,
                  "signature" : 100
                }
              },
              "ripper" : {
                "count" : 129945,
                "weapon" : {
                  "damage" : {
                    "min" : 36,
                    "max" : 45
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 22,
                  "signature" : 100
                }
              },
              "horror" : {
                "count" : 190,
                "weapon" : {
                  "damage" : {
                    "min" : 0,
                    "max" : 0
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 85,
                  "signature" : 100
                }
              },
              // "slider" : {
              //   "count" : 189,
              //   "weapon" : {
              //     "damage" : {
              //       "min" : 240,
              //       "max" : 300
              //     },
              //     "signature" : 100
              //   },
              //   "health" : {
              //     "armor" : 1000,
              //     "signature" : 100
              //   }
              // },
              "breaker" : {
                "count" : 1576,
                "weapon" : {
                  "damage" : {
                    "min" : 120,
                    "max" : 150
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 500,
                  "signature" : 100
                }
              },
              "crusher" : {
                "count" : 146,
                "weapon" : {
                  "damage" : {
                    "min" : 1200,
                    "max" : 1500
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 35000,
                  "signature" : 100
                }
              },
              // "geccon" : {
              //   "count" : 107,
              //   "weapon" : {
              //     "damage" : {
              //       "min" : 7600,
              //       "max" : 9500
              //     },
              //     "signature" : 100
              //   },
              //   "health" : {
              //     "armor" : 2000,
              //     "signature" : 100
              //   }
              // },
              "amfizben" : {
                "count" : 2681,
                "weapon" : {
                  "damage" : {
                    "min" : 180,
                    "max" : 225
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 350,
                  "signature" : 100
                }
              },
              "amphibian" : {
                "count" : 1198,
                "weapon" : {
                  "damage" : {
                    "min" : 4400,
                    "max" : 5500
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 2500,
                  "signature" : 100
                }
              },
              "chipping" : {
                "count" : 150,
                "weapon" : {
                  "damage" : {
                    "min" : 44000,
                    "max" : 55000
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 150000,
                  "signature" : 100
                }
              },
              "toofucking" : {
                "count" : 69,
                "weapon" : {
                  "damage" : {
                    "min" : 16000,
                    "max" : 20000
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 30000,
                  "signature" : 100
                }
              },
              "patron" : {
                "count" : 141,
                "weapon" : {
                  "damage" : {
                    "min" : 20000,
                    "max" : 25000
                  },
                  "signature" : 100
                },
                "health" : {
                  "armor" : 15000,
                  "signature" : 100
                }
              }
            }
          }
        }
      );

      // Battle.addGroup(battle.id, '1', 'Zav', {
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
      Game.SpaceEvents.spawnTradeFleet(hand, segment);
    },

    'cheats.sendReptileFleetToPlanet': function(planetId) {
      Game.SpaceEvents.sendReptileFleetToPlanet(planetId);
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