import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'lodash';
import { $ } from 'meteor/jquery';
import { buzz } from '/moduls/game/lib/importCompability';

const tracks = {
  attack: 'Attack',
  buildingStart: 'BuildingStart',
  invaders: 'Invaders',
  notice: 'Notification',
  press: 'onButtonPress',
  close: 'onClose',
  hover: 'onHover',
};

const player = {};

const SoundManager = {
  isMuted: new ReactiveVar(false),
  getUserMute() {
    return Meteor.user()
      && Meteor.user().settings
      && Meteor.user().settings.options
      && Meteor.user().settings.options.muteSound;
  },
  muteToggle() {
    if (Meteor.user()) {
      Meteor.call(
        'settings.setOption',
        'muteSound',
        !this.isMuted.get(),
      );
    }
    this.isMuted.set(!this.isMuted.get());

    if (this.isMuted.get()) {
      player.welcome.mute();
    } else {
      player.welcome.unmute();
    }
  },
  play(action) {
    if (this.isMuted.get()) {
      return;
    }
    player[action].stop().play();
  },
  welcome() {
    player.welcome.fadeTo(15, 3000);
  },
  login() {
    player.welcome.fadeTo(0, 1000, () => {
      player.welcome.stop();
    });
  },
};


const selectors = {
  hover: [
    '[data-sound*="hover"]',
    'a[href]',
    'button',
    '[data-tooltip]:not(.main_menu li):not(.cw--Menu__itemIcon):not(.cw--Menu__itemStatus):not(.cw--MenuUnits__itemCount):not(.cw--MenuUnique__itemLevel)',
    'input',
    '.cw--button',
    '.cw--UserMenu__icon',
    '.cw--UserMenu__menuItem',
    '.quest > ul > li',
    '.entranceReward .take',
    '.entranceReward .roll',
    '.entranceReward .paymentItems .rewardItem',
  ],
  click: [
    '[data-sound*="click"]',
    '.cw--Menu__item',
    '.cw--ResourceCurrent__resource_credits',
    '.cw--ResourceCurrent__artifacts',
    '.menu .main_menu a',
    '.menu .second_menu li:not(.active) a',
    '.cw--button_type_primary_blue',
    '.cw--button_flat',
    '.consul-items a:not(.active)',
    '.entranceReward .take',
    '.entranceReward .roll',
    '.entranceReward .paymentItems .rewardItem',
    'button.buy',
    'div.button',
    '.cw--ContainerList__image',
    '.cw--ContainerRewardOpener .cw--button',
    '.cw--UserMenu__button',
    '.modal.quest .neutral',
    '.additional_area',
    '.additional_area ul.quests > li',
    '.cw--ColosseumTournament__tournament',
    '.map-planet-popup .button-attack',
  ],
  close: [
    '[data-sound*="close"]',
    '.close',
    '.cw--button_close',
  ],
  build: [
    '[data-sound*="build"]',
  ],
  attack: [
    '[data-sound*="attack"]',
    '.attack-menu .btn-attack',
  ],
};

const hoverEvent = () => SoundManager.play('hover');
const clickEvent = () => SoundManager.play('press');
const closeEvent = () => SoundManager.play('close');
const attackEvent = () => SoundManager.play('attack');
const buildEvent = () => SoundManager.play('buildingStart');

const init = function() {
  _.keys(tracks).forEach((key) => {
    player[key] = new buzz.sound(`/sound/${tracks[key]}.mp3`);
    if (key !== 'hover') {
      player[key].setVolume(30);
    }
    if (key === 'buildingStart') {
      player[key].setVolume(28);
    }
  });
  player.welcome = new buzz.sound('http://times.consulwar.ru/music/2 Коварство Рептилоидов.mp3', {
    volume: 0,
    loop: true,
  });

  $(document).on('mouseenter', selectors.hover.join(), hoverEvent);
  $(document).on('click', selectors.click.join(), clickEvent);
  $(document).on('click', selectors.close.join(), closeEvent);
  $(document).on('click', selectors.attack.join(), attackEvent);
  $(document).on('click', selectors.build.join(), buildEvent);
};

init();

export default SoundManager;
