import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import { ReactiveArray } from 'meteor/manuel:reactivearray';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import Game, { game } from '/moduls/game/lib/main.game';
import unitItems from '/imports/content/Unit/client';
import Battle from '/moduls/battle/lib/imports/battle';
import '/imports/client/ui/blocks/Space/History/Battle/SpaceHistoryBattle';
import '/imports/client/ui/blocks/Space/Planet/SpacePlanet';
import '/imports/client/ui/blocks/Resource/Price/ResourcePrice';
import '/imports/client/ui/Paging/Paging';
import './SpaceHistory.html';
import './SpaceHistory.styl';

class SpaceHistory extends BlazeComponent {
  template() {
    return 'SpaceHistory';
  }

  onCreated() {
    super.onCreated();

    this.mainUserName = Meteor.user().username;

    this.historyBattles = new ReactiveArray();
    this.currentBattle = new ReactiveVar();
    this.isLoading = new ReactiveVar(true);

    this.itemsPerPage = 10;
    this.pagesTotal = new ReactiveVar(1);
    this.currentPage = new ReactiveVar(1);

    this.autorun(() => {
      this.getHistory();
      $('.cw--SpaceHistory__list').scrollTop(0);
    });
  }

  onRendered() {
    super.onRendered();

    $('.cw--SpaceHistory__list').perfectScrollbar();
  }

  battles() {
    return this.historyBattles.list();
  }

  getHistory() {
    this.isLoading.set(true);
    this.historyBattles.clear();
    Meteor.call(
      'battle.getPage',
      this.currentPage.get(),
      this.itemsPerPage,
      this.data().isEarth,
      (err, { battles, totalCount }) => {
        this.pagesTotal.set(Math.ceil(totalCount / this.itemsPerPage));
        this.isLoading.set(false);
        if (err) {
          Notifications.error('Не удалось получить историю боёв', err.error);
        } else {
          // parse battles
          for (let i = 0; i < battles.length; i += 1) {
            this.historyBattles.push(this.getBattleInfo(battles[i]));
          }
        }
      },
    );
  }

  loadBattle(event, itemId) {
    if (
      this.currentBattle.get()
      && itemId === this.currentBattle.get().id
    ) {
      this.currentBattle.set(false);
      return;
    }
    // try to get record from cache
    for (let i = 0; i < this.historyBattles.length; i += 1) {
      if (this.historyBattles[i].id === itemId) {
        this.currentBattle.set(this.historyBattles[i]);
        return;
      }
    }
    Notifications.error('Не удалось получить информацию о бое');
  }

  getBattleInfo(battle) {
    const user = Meteor.user();
    const result = {
      id: battle._id,
      resultId: battle.result,
      round: battle.round,
      status: battle.status,
    };
    // парсить планету будем при отображении
    result.planetId = battle.options.planetId;

    if (battle.options && battle.options.isEarth) {
      result.isEarth = true;
      result.zoneName = battle.options.zoneName;
    }

    if (result.planetId) {
      result.isHome = this.getBattlePlanet(result.planetId).isHome;
    }

    const { missionType, missionLevel } = battle.options;
    if (missionType) {
      result.mission = `${Game.Battle.items[missionType].name} ${missionLevel}`;
    }

    // Convert time to timeStamp
    result.timestamp = Math.floor(battle.timeStart.valueOf() / 1000);

    // Распарсить ресурсы, потерянные при грабеже нашего дома
    if (battle.lostResources) {
      result.lostResources = _.map(battle.lostResources, count => count * -1);
    }

    // Parsing reward
    if (battle.reward && !_.isEmpty(battle.reward[user.username])) {
      result.reward = battle.reward[user.username];
    } else {
      result.reward = result.lostResources;
    }

    // Parsing army
    result.users = {};

    // Parsing users
    Object.entries(battle.sides[Battle.USER_SIDE]).forEach(([userName, userData]) => {
      const userObj = {
        power: userData.power,
      };

      // adding current user reward to userObject
      if (battle.reward && !_.isEmpty(battle.reward[userName])) {
        userObj.reward = battle.reward[userName];
      } else {
        userObj.reward = result.lostResources;
      }

      // lost user's units price counter
      userObj.lostUnitsPrice = {};

      // All user squads
      userObj.squads = [];

      // All user's units
      const allUnitsStart = {};
      const allUnitsEnd = {};

      // parsing userSquads
      userData.groups.forEach((squad) => {
        const unitsStart = {};
        const unitsEnd = {};
        _.toPairs(squad).forEach(([id, unit]) => {
          // adding unit counters to current squad
          unitsStart[id] = unit.initial;
          unitsEnd[id] = unit.current;
          // adding unit counters to all user units
          allUnitsStart[id] = (allUnitsStart[id] || 0) + unit.initial;
          allUnitsEnd[id] = (allUnitsEnd[id] || 0) + unit.current;

          // Lost Units is NEGATIVE number
          const lostUnits = unitsEnd[id] - unitsStart[id];
          // summing price to userObj.lostUnitsPrice
          _.toPairs(unitItems[id].getPrice(lostUnits)).forEach(([name, price]) => {
            if (name !== 'time') {
              if (!userObj.lostUnitsPrice[name]) {
                userObj.lostUnitsPrice[name] = 0;
              }
              userObj.lostUnitsPrice[name] += price;
            }
          });
        });

        const unitsResult = this.getArmyInfo(unitsStart, unitsEnd);
        (userObj.squads).push(unitsResult);
      });

      // when user has more than 1 squad
      // add first element "all Units" to top of squads array
      // otherwise first (single) squad = all Units
      if (userObj.squads.length > 1) {
        const allUnits = this.getArmyInfo(allUnitsStart, allUnitsEnd);
        (userObj.squads).splice(0, 0, allUnits);
      }

      // moving user Object to result
      result.users[userName] = userObj;
    });


    // parsing Enemy Units
    const enemyUnits = {};
    const enemyUnitsLeft = {};
    const enemySquads = [];
    const enemySquadsLeft = [];
    battle.sides[Battle.ENEMY_SIDE].ai.groups.forEach((group) => {
      const squad = {};
      const squadLeft = {};
      _.toPairs(group).forEach(([id, unit]) => {
        squad[id] = unit.initial;
        squadLeft[id] = unit.current;
        enemyUnits[id] = (enemyUnits[id] || 0) + unit.initial;
        enemyUnitsLeft[id] = (enemyUnitsLeft[id] || 0) + unit.current;
      });
      enemySquads.push(squad);
      enemySquadsLeft.push(squadLeft);
    });

    result.enemyUnits = this.getArmyInfo(enemyUnits, enemyUnitsLeft);

    // Count summary resource profit
    const { lostUnitsPrice } = result.users[this.mainUserName];

    if (lostUnitsPrice || result.reward) {
      result.summaryProfit = {
        humans: 0,
        metals: 0,
        crystals: 0,
        honor: 0,
      };
      _.keys(result.summaryProfit).forEach((key) => {
        result.summaryProfit[key] += lostUnitsPrice[key] || 0;
      });
      _.keys(result.reward).forEach((key) => {
        result.summaryProfit[key] = (result.summaryProfit[key] || 0) + result.reward[key];
      });
    }

    result.isBattle1x1 = battle.isBattle1x1;

    return result;
  }

  getArmyInfo(units, rest) {
    const result = [];

    _.toPairs(units).forEach(([id, count]) => {
      const unit = unitItems[id];
      let countStart = count;
      if (_.isString(count)) {
        countStart = game.Battle.count[count];
      }

      if (countStart <= 0) {
        return;
      }

      let countAfter = 0;
      if (rest && rest[id]) {
        countAfter = rest[id];
      }

      result.push({
        id,
        order: unit.order,
        start: countStart,
        end: countAfter,
      });
    });

    if (result.length) {
      return _.sortBy(result, function(item) { return item.order; });
    }

    return null;
  }

  getBattlePlanet(planetId) {
    let planet = Game.Planets.getOne(planetId);
    if (!planet) {
      planet = {
        isEmpty: true,
        isDisabled: true,
        name: 'скрытая',
        location: 'галактика',
        size: Game.Random.interval(2, 5),
        type: _.sample(_.toArray(Game.Planets.types)).engName,
      };
    }
    return planet;
  }

  closeWindow() {
    this.removeComponent();
  }
}

SpaceHistory.register('SpaceHistory');

export default SpaceHistory;
