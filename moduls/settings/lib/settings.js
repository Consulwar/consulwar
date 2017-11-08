initSettingsLib = function() {
'use strict';

Game.Settings = {
  emailLettersFrequency: [
    {title:'1 день', engName: 'everyDay'},
    {title:'3 дня', engName: 'everyThreeDays'},
    {title:'7 дней', engName: 'everySevenDays'},
    {title:'1 месяц', engName: 'everyMonth'},
    {title:'только акции', engName: 'onlyPromotion'},
    {title:'только рестарт игры', engName: 'onlyRestart'}
  ],

  notificationFields: ['showDesktopNotifications', 'notShowQuestsDuringActivation'],

  options: {
    hideDescription: [true, false],
    hideFleetInfo: [true, false],
    showFleetInfoFull: [true, false],
    hideFleetsOnZoomOut: [true, false],
    hideNet: [true, false],
    compactFleetInfo: [true, false],
    rotatePlanets: [true, false],
    rareScreenUpdates: [true, false],
    wideChat: [true, false],
    showDistanceFromPlanets: [true, false],
    mobileVersion: [true, false],
    textUnits: [true, false],
    completeUnitToHangar: [true, false],
  }
};


};