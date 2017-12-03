import ContainerPopup from '/imports/client/ui/Container/popup/ContainerPopup';

initBuildingSpecialContainerClient = function() {
'use strict';

initBuildingSpecialContainerLib();

Meteor.subscribe('containers');

Game.Building.special.Container.showWindow = function() {
  Game.Popup.show({
    template: ContainerPopup.renderComponent(),
  });
};

};