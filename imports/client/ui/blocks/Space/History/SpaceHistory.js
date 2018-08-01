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

    this.historyBattles = new ReactiveArray();
    this.currentBattle = new ReactiveVar();
    this.isLoading = new ReactiveVar(true);
    this.isLoadingBattle = new ReactiveVar(true);

    this.itemsPerPage = 20;
    this.pagesTotal = new ReactiveVar();
    this.currentPage = new ReactiveVar(1);

    const countTotalBattles = Game.Statistic.getUserValue('battle.total');
    this.pagesTotal.set(Math.floor(countTotalBattles / this.itemsPerPage));

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
      false,
      (err, battles) => {
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
    if (!itemId) {
      return;
    }
    if (
      this.currentBattle.get()
      && itemId === this.currentBattle.get().id
    ) {
      this.currentBattle.set(false);
      return;
    }
    // try to get record from cache
    let isFound = false;
    for (let i = 0; i < this.historyBattles.length; i += 1) {
      if (this.historyBattles[i].id === itemId) {
        isFound = true;
        this.currentBattle.set(this.historyBattles[i]);
        this.isLoadingBattle.set(false);
        break;
      }
    }

    // not found, then load from server
    if (!isFound) {
      this.isLoadingBattle.set(true);
      Meteor.call(
        'battleHistory.getById',
        itemId,
        (err, data) => {
          this.isLoadingBattle.set(false);
          if (err) {
            Notifications.error(
              'Не удалось получить информацию о бое',
              err.error,
            );
          } else {
            this.currentBattle.set(this.getBattleInfo(data));
          }
        },
      );
    }
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
    const userUnits = {};
    battle.initialUnits[Battle.USER_SIDE][user.username].forEach((units) => {
      _.toPairs(units).forEach(([id, { count }]) => {
        userUnits[id] = (userUnits[id] || 0) + count;
      });
    });

    const userUnitsLeft = {};
    battle.currentUnits[Battle.USER_SIDE][user.username].forEach((units) => {
      _.toPairs(units).forEach(([id, { count }]) => {
        userUnitsLeft[id] = (userUnitsLeft[id] || 0) + count;
      });
    });

    const enemyUnits = {};
    battle.initialUnits[Battle.ENEMY_SIDE].ai.forEach((units) => {
      _.toPairs(units).forEach(([id, { count }]) => {
        enemyUnits[id] = (enemyUnits[id] || 0) + count;
      });
    });

    const enemyUnitsLeft = {};
    battle.currentUnits[Battle.ENEMY_SIDE].ai.forEach((units) => {
      _.toPairs(units).forEach(([id, { count }]) => {
        enemyUnitsLeft[id] = (enemyUnitsLeft[id] || 0) + count;
      });
    });

    result.userUnits = this.getArmyInfo(userUnits, userUnitsLeft);
    result.enemyUnits = this.getArmyInfo(enemyUnits, enemyUnitsLeft);

    // Считаем потери
    result.lostUnitsPrice = {
      humans: 0,
      metals: 0,
      crystals: 0,
    };

    if (result.userUnits) {
      result.lostUnitsCount = 0;

      _.forEach(result.userUnits, (unit) => {
        const lostCount = unit.start - unit.end;
        result.lostUnitsCount += lostCount;

        if (lostCount) {
          if (unit.resourcesLost.metals) {
            result.lostUnitsPrice.metals += unit.resourcesLost.metals;
          }
          if (unit.resourcesLost.crystals) {
            result.lostUnitsPrice.crystals += unit.resourcesLost.crystals;
          }
          if (unit.resourcesLost.humans) {
            result.lostUnitsPrice.humans += unit.resourcesLost.humans;
          }
        }
      });
    }

    // Count summary resource profit
    if (result.lostUnitsCount || result.reward) {
      result.summaryProfit = {
        humans: 0,
        metals: 0,
        crystals: 0,
        honor: 0,
      };
      _.keys(result.summaryProfit).forEach((key) => {
        result.summaryProfit[key] -= result.lostUnitsPrice[key] || 0;
        result.summaryProfit[key] += result.reward[key] || 0;
      });
    }

    result.isBattle1x1 = Battle.isBattle1x1(battle);

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

      let resourcesLost = null;
      if (countStart - countAfter > 0) {
        resourcesLost = unit.getPrice(countStart - countAfter);
      }

      result.push({
        id,
        title: unit.title,
        order: unit.order,
        start: countStart,
        end: countAfter,
        resourcesLost,
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
