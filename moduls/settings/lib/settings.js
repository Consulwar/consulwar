import { Meteor } from 'meteor/meteor';

initSettingsLib = function() {
'use strict';

Game.Settings = {
  emailLettersFrequency: [
    {title:'1 день', engName: 'everyDay'},
    {title:'3 дня', engName: 'everyThreeDays'},
    {title:'7 дней', engName: 'everySevenDays'},
    {title:'1 месяц', engName: 'everyMonth'},
    {title:'только акции', engName: 'onlyPromotion'},
  ],

  notificationFields: ['showDesktopNotifications', 'notShowQuestsDuringActivation'],

  options: {
    hideDescription: [true, false],
    hideFleetInfo: [true, false],
    showFleetInfoFull: [true, false],
    hideNet: [true, false],
    compactFleetInfo: [true, false],
    rotatePlanets: [true, false],
    rareScreenUpdates: [true, false],
    wideChat: [true, false],
    showDistanceFromPlanets: [true, false],
    mobileVersion: [true, false],
    textUnits: [true, false],
    moveCompletedUnitToHangar: [true, false],
    disableAutoCollect: [true, false],
    isMultiSkinEnabled: [false, true],
    disableBroadcast: [true, false],
    muteSound: [true, false],
    hideMutualHexes: [false, true],
    chatDratuti: [true]
  },

  getOption({
    name,
    user = Meteor.user(),
  }) {
    return (
         user
      && user.settings
      && user.settings.options
      && user.settings.options[name]
    );
  },
};

if (Meteor.settings.public.chat && Meteor.settings.public.chat.possibleToDisableDratuti) {
  Game.Settings.options.chatDratuti.push(false);
}

};
