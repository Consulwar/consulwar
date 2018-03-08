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
    this.render('item_research', {
      to: 'content',
      data: {
        research: item,
        level: new ReactiveVar(item.getCurrentLevel() + 1),
      }
    });
  } else {
    this.render('empty', {to: 'content'});
  }
};

Template.item_research.helpers({
  getRequirements() {
    return this.research.getRequirements({ level: this.level.get() });
  },
});

Template.item_research.events({
  'click button.build': function(e, t) {
    var item = t.data.research;

    Meteor.call(
      'research.start',
      {
        id: item.id,
        level: this.level.get(),
      },
      function(error, message) {
        if (error) {
          Notifications.error('Невозможно начать исследование', error.error);
        } else {
          Notifications.success('Исследование запущено');
        }
      },
    );

    if (item.getCurrentLevel() === 0) {
      Router.go(item.url({group: item.group}));
    }
  },

  'click button.max': function(e, t) {
    const item = t.data.research;
    let currentLevel = item.getCurrentLevel() + 1;

    while ((currentLevel + 1) <= item.maxLevel && item.canBuild(currentLevel + 1)) {
      currentLevel += 1;
    }

    this.level.set(currentLevel);
  },

  'click .toggle_description': function(e, t) {
    $(t.find('.description')).slideToggle(function() {
      var options = Meteor.user().settings && Meteor.user().settings.options;
      Meteor.call('settings.setOption', 'hideDescription', !(options && options.hideDescription));
    });
  }
});

};