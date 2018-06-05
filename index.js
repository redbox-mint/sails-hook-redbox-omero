const _ = require('lodash');

const OMEROService = require('./api/services/OMEROService');
const OMEROController = require('./api/controllers/OMEROController');

const recordTypeConfig = require('./config/recordtype');
const workflowConfig = require('./config/workflow');
const recordFormConfig = require('./form-config/omero-1.0-draft');

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
        'get /:branding/:portal/ws/omero/projects': function(){return 'hello'}
      }
    },
    configure: function () {
      sails.services['OMEROService'] = OMEROService;
      sails.config = _.merge(sails.config, recordTypeConfig);
      sails.config = _.merge(sails.config, workflowConfig);
      sails.config['form']['forms'] = _.merge(sails.config['form']['forms'], {'omero-1.0-draft': recordFormConfig});
    }
  }
};
