initCosmosServer = function() {
  'use strict';

  initCosmosLib();
  initCosmosContentServer();
  initCosmosConfigServer();
  initCosmosPlanetsServer();
  initCosmosEventsServer();
};