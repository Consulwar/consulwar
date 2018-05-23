import { Meteor } from 'meteor/meteor';
import UserSettings from '/imports/client/ui/blocks/User/Settings/UserSettings';

initSettingsClient = function() {
'use strict';

initSettingsLib();

Game.Settings.show = function() {
  Game.Popup.show({
    template: UserSettings.renderComponent(),
  });
};
};