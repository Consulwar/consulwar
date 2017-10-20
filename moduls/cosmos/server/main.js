initCosmosServer = function() {
  'use strict';

  require('../../../imports/modules/space/server/methods');

  initCosmosLib();
  initCosmosContentServer();
  initCosmosPlanetsServer();
};
