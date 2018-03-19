import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { _ } from 'lodash';
import { Notifications } from '/moduls/game/lib/importCompability';
import Colosseum from '/imports/content/Building/Residential/client/Colosseum';
import Game from '/moduls/game/lib/main.game';
import ColosseumReward from '/imports/client/ui/blocks/Colosseum/Reward/ColosseumReward';
import './ColosseumTournament.html';
import './ColosseumTournament.styl';

class ColosseumTournament extends BlazeComponent {
  template() {
    return 'ColosseumTournament';
  }

  constructor() {
    super();

    this.selectedTournament = new ReactiveVar('green_ring');
  }

  tournaments() {
    return _.map(Game.Building.special.Colosseum.tournaments, function(item) {
      return item;
    });
  }

  timeCooldown() {
    const user = Meteor.user();
    const level = Colosseum.getCurrentLevel();

    let timeLeft = user.timeLastTournament - Game.getCurrentServerTime();
    timeLeft += Game.Building.special.Colosseum.getCooldownPeriod(level);

    return timeLeft > 0 ? timeLeft : null;
  }

  selected() {
    const selected = this.selectedTournament.get();
    return selected && Game.Building.special.Colosseum.tournaments[selected];
  }

  selectTournament(event, tournament) {
    if (tournament.checkLevel()) {
      this.selectedTournament.set(tournament.engName);
    }
  }

  start() {
    const item = Game.Building.special.Colosseum.tournaments[this.selectedTournament.get()];

    if (!item || !item.checkLevel()) {
      Notifications.error('Недостаточный уровень Колизея');
      return;
    }

    if (!item.checkPrice()) {
      Notifications.error('Недостаточно чести');
      return;
    }

    if (!Game.Building.special.Colosseum.checkCanStart()) {
      Notifications.error('Турнир уже проводился сегодня');
      return;
    }

    Meteor.call('colosseum.startTournament', item.engName, function(err, profit) {
      if (err) {
        Notifications.error('Не удалось провести турнир', err.error);
        return;
      }
      // show reward window
      if (profit && profit.resources) {
        Game.Popup.show({
          template: (new ColosseumReward({
            hash: {
              reward: profit.resources,
            },
          })).renderComponent(),
        });
      }
    });
  }
  goBack() {
    Router.go(Colosseum.url());
  }
}

ColosseumTournament.register('ColosseumTournament');

export default ColosseumTournament;
