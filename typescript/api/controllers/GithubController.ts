declare var module;
declare var sails: Sails;

const url = require('url');
const local = require('../../config/local');

declare var GithubService;

/**
 * Package that contains all Controllers.
 */

import controller = require('../core/CoreController');

export module Controllers {

  export class GithubController extends controller.Controllers.Core.Controller {
    /**
     * Exported methods, accessible from internet.
     */
    protected _exportedMethods: any = [
      'projects'
    ];

    constructor() {
      super();
    }

    public projects(req, res) {
      const username = req.param('username');
      const password = req.param('password');
      sails.services['GithubService'].projects(username, password)
        .subscribe(response => {
          this.ajaxOk(req, res, null, {response: response, status: true});
        }, error => {
          sails.log.error(error);
          const errorMessage = `Failed to get projects for user: ${username}`;
          sails.log.error(errorMessage);
          this.ajaxFail(req, res, errorMessage, error);
        });

    }

  }



}

module.exports = new Controllers.GithubController().exports();
