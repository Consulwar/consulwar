import { _ } from 'lodash';
import Game from '/moduls/game/lib/main.game';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
// import { buzz } from 'meteor/brentjanderson:buzz';

Game.muteSound = new ReactiveVar();

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
  muteToggle() {
    Game.muteSound.set(!Game.muteSound.get());
  },
  play(action) {
    if (Game.muteSound.get()) {
      return;
    }
    player[action].play();
  },
};


const selectors = {
  hover: [
    'a[href]',
    'button',
    'input',
    '.cw--button',
    '.cw--UserMenu__icon',
    '.cw--UserMenu__menuItem',
    '[data-tooltip]',
    '.quest > ul > li',
    '.entranceReward .take',
    '.entranceReward .roll',
    '.entranceReward .paymentItems .rewardItem',
  ],
  click: [
    '.cw--Menu__item',
    '.cw--ResourceCurrent__resource_credits',
    '.cw--ResourceCurrent__artifacts',
    '.menu .main_menu a',
    '.menu .second_menu li:not(.active) a',
    '.greenButton',
  ],
  close: [
    '.close',
    '.cw--button_close',
  ],
};

const hoverEvent = () => SoundManager.play('hover');
const clickEvent = () => SoundManager.play('press');
const closeEvent = () => SoundManager.play('close');

const init = function() {
  _.keys(tracks).forEach((key) => {
    player[key] = new buzz.sound(`/sound/${tracks[key]}.mp3`);
  });

  $(document).on('mouseenter', selectors.hover.join(), hoverEvent);
  $(document).on('click', selectors.click.join(), clickEvent);
  $(document).on('click', selectors.close.join(), closeEvent);
};

init();

export default SoundManager;
