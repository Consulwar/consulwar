import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import Game from '/moduls/game/lib/main.game';
import Unit from '/imports/client/ui/blocks/Build/Unit/BuildUnit';
import humanUnits from '/imports/content/Unit/Human/client';
import humanSpaceUnits from '/imports/content/Unit/Human/Space/client';
import humanDefenseUnits from '/imports/content/Unit/Human/Defense/client';
import humanGroundUnits from '/imports/content/Unit/Human/Ground/client';
import reptileUnits from '/imports/content/Unit/Reptile/client';
import reptileSpaceUnits from '/imports/content/Unit/Reptile/Space/client';
import reptileGroundUnits from '/imports/content/Unit/Reptile/Ground/client';
import MenuUnits from '/imports/client/ui/blocks/Menu/Units/MenuUnits';

initUnitClient = function() {
'use strict';

initUnitLib();
initSquadLib();
initWrecksLib();

Meteor.subscribe('squad');
Meteor.subscribe('wrecks');

Game.Unit.showPage = function() {
  let item;
  let group = this.params.group;

  let menuItems;
  if (group === 'Space') {
    menuItems = humanSpaceUnits;
  } else if (group === 'Defense') {
    menuItems = humanDefenseUnits;
  } else {
    menuItems = humanGroundUnits;
  }

  if (this.params.item) {
    const engName = this.params.item;
    if (group === 'Ground') {
      group = `Ground/${this.params.subgroup}`;
    }
    const id = `Unit/Human/${group}/${engName}`;
    item = humanUnits[id];
  }

  this.render(
    (new MenuUnits({
      hash: {
        items: menuItems,
        selected: item,
      },
    })).renderComponent(),
    { to: 'bottomMenu' }
  );
  
  if (item) {
    this.render(
      new Unit({ 
        hash: {
          unit: item,
        },
      }).renderComponent(),
      { to: 'content' }
    );
  } else {
    this.render('empty', { to: 'content' });
  }
};
};