const _ = require('lodash');

const GithubService = require('./api/services/GithubService');
const GithubController = require('./api/controllers/GithubController');
const recordTypeConfig = require('./config/recordtype');
const workflowConfig = require('./config/workflow');
const recordFormConfig = require('./form-config/github-1.0-draft');

module.exports = function (sails) {
  return {
    initialize: function (cb) {
      // Do Some initialisation tasks
      // This can be for example: copy files or images to the redbox-portal front end
      return cb();
    },
    //If each route middleware do not exist sails.lift will fail during hook.load()
    routes: {
      before: {},
      after: {
        'get /:branding/:portal/ws/github/projects': GithubController.projects
      }
    },
    configure: function () {
      sails.services['GithubService'] = GithubService;
      sails.config = _.merge(sails.config, recordTypeConfig);
      sails.config = _.merge(sails.config, workflowConfig);
      sails.config['form']['forms'] = _.merge(sails.config['form']['forms'], {'github-1.0-draft': recordFormConfig});
    }
  }
};
