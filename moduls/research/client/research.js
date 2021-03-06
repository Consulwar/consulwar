import Research from '/imports/client/ui/blocks/Build/Research/BuildResearch';
import researches from '/imports/content/Research/client';
import evolutionResearches from '/imports/content/Research/Evolution/client';
import fleetResearches from '/imports/content/Research/Fleet/client';
import MenuUnique from '/imports/client/ui/blocks/Menu/Unique/MenuUnique';

initResearchClient = function() {
'use strict';

initResearchLib();

Game.Research.showPage = function() {
  let item;
  const group = this.params.group[0].toUpperCase() + this.params.group.slice(1);
  let menuItems;
  if (group === 'Evolution') {
    menuItems = evolutionResearches;
  } else {
    menuItems = fleetResearches;
  }
  if (this.params.item) {
    const engName = this.params.item[0].toUpperCase() + this.params.item.slice(1);
    const id = `Research/${group}/${engName}`;
    item = researches[id];
  }

  this.render(
    (new MenuUnique({
      hash: {
        items: menuItems,
        selected: item,
      },
    })).renderComponent(),
    { to: 'bottomMenu' }
  );

  if (item) {
    const queue = item.getQueue();
    this.render(
      new Research({
        hash: {
          research: item,
          level: new ReactiveVar(queue ? queue.level : item.getCurrentLevel() + 1),
        },
      }).renderComponent(),
      { to: 'content' }
    );
  } else {
    this.render('empty', {to: 'content'});
  }
};
};
