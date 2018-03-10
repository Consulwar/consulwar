import UnitRepair from '/imports/client/ui/blocks/Unit/Repair/UnitRepair';

initUnitClientWrecks = function() {
'use strict';

initWrecksLib();

Meteor.subscribe('wrecks');

Game.Wrecks.showPopup = function(unit) {
  Game.Popup.show({
    template: (new UnitRepair({
      hash: {
        unit: unit,
      },
    })).renderComponent(),
  });
};

};
