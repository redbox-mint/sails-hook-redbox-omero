import { Observable } from 'rxjs/Rx';

import services = require('../core/CoreService');
import { Sails, Model } from 'sails';

declare var sails: Sails;
declare var _this;
declare var User: Model;

export module Services {

  export class OMEROService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
    ];

  }

}

module.exports = new Services.OMEROService().exports();
