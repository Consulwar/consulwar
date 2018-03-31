import { Meteor } from 'meteor/meteor';
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
  muteToggle() {
    const options = Meteor.user().settings && Meteor.user().settings.options;
    Meteor.call(
      'settings.setOption',
      'muteSound',
      !(options && options.muteSound),
    );
  },
  play(action) {
    if (Meteor.user().settings.options.muteSound) {
      return;
    }
    player[action].stop().play();
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
    '.greenButton',
    '.cw--button_type_primary_blue',
    '.cw--button_type_primary_green',
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
  attack: [
    '[data-sound*="attack"]',
    '.attack-menu .btn-attack',
  ],
};

const hoverEvent = () => SoundManager.play('hover');
const clickEvent = () => SoundManager.play('press');
const closeEvent = () => SoundManager.play('close');
const attackEvent = () => SoundManager.play('attack');

const init = function() {
  _.keys(tracks).forEach((key) => {
    player[key] = new buzz.sound(`/sound/${tracks[key]}.mp3`);
  });

  $(document).on('mouseenter', selectors.hover.join(), hoverEvent);
  $(document).on('click', selectors.click.join(), clickEvent);
  $(document).on('click', selectors.close.join(), closeEvent);
  $(document).on('click', selectors.attack.join(), attackEvent);
};

init();

export default SoundManager;
