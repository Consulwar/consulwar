import '/imports/modules/Research/server/api';
import ResearchCollection from '/imports/modules/Research/lib/ResearchCollection';

initResearchServer = function() {
'use strict';

initResearchLib();

ResearchCollection._ensureIndex({
  user_id: 1,
});

Meteor.publish('researches', function() {
  if (this.userId) {
    return ResearchCollection.find({ user_id: this.userId });
  }
  return null;
});

};