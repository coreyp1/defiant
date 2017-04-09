"use strict";

const Handler = require('./handler');

module.exports = function(handlerToExtend, id, path, weight=0) {
  function VirtualHandler() {
    return new handlerToExtend(...arguments)
  };
  VirtualHandler.id = id;
  VirtualHandler.path = path;
  VirtualHandler.weight = weight;
  return VirtualHandler;
}
