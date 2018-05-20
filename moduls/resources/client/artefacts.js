import artifacts from '/imports/content/Resource/Artifact/client';
import MenuArtifacts from '/imports/client/ui/blocks/Menu/Artifacts/MenuArtifacts';
import Artifact from '/imports/client/ui/blocks/Artifact/Artifact';

initResourcesClientArtefacts = function() {
'use strict';

Game.Resources.showArtefactsPage = function() {
  var item = Game.Artefacts.items[this.params.item];
  
  this.render(
    (new MenuArtifacts({
      hash: {
        items: artifacts,
        selected: item,
      },
    })).renderComponent(),
    { to: 'bottomMenu' }
  );

  this.render(
    (new Artifact({
      hash: {
        item,
      },
    })).renderComponent(),
    { to: 'content' },
  );
};
};