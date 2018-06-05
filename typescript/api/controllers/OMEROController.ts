declare var module;
declare var sails: Sails;

const url = require('url');

declare var OMEROService;

/**
 * Package that contains all Controllers.
 */

import controller = require('../core/CoreController');

export module Controllers {

  export class OMEROController extends controller.Controllers.Core.Controller {
    /**
     * Exported methods, accessible from internet.
     */
    protected _exportedMethods: any = [
    ];

    _config: any = {};

    constructor() {
      super();
    }

  }



}

module.exports = new Controllers.OMEROController().exports();
