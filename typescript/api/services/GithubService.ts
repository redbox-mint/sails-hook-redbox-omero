import { Observable } from 'rxjs/Rx';

import services = require('../core/CoreService');
import { Sails, Model } from 'sails';
const GitHub = require('github-api');

declare var sails: Sails;
declare var _this;
declare var User: Model;

export module Services {

  export class GithubService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'projects',
    ];

    projects(username, password) {
      var gh = new GitHub({
        username: username,
        password: password
        /* also acceptable:
					 token: 'MY_OAUTH_TOKEN'
				 */
      });
      const user = gh.getUser(username);
      const filterOpts = {
        type: 'owner',
        sort: 'updated',
        per_page: 10,
        page: 10,
      };
      return Observable.fromPromise(user.listRepos(filterOpts));
    }

  }

}

module.exports = new Services.GithubService().exports();
