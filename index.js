const _ = require('lodash');
const ncp = require('ncp');
const fs = require('fs-extra');

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
      // To test run with: NODE_ENV=test mocha
      // The Hook is environment specific, that is, the environments are also available whenever the sails app is hooked
      let angularDest;
      let angularOrigin;
      ncp.limit = 16;
      let angularTmpDest = '.tmp/public/angular/omero';

      if (sails.config.environment === 'test') {
        angularOrigin = './app/omero/src';
        angularDest = 'test/angular/omero';
      }
      else {
        angularOrigin = './node_modules/sails-hook-redbox-omero/app/omero/dist';
        angularDest = './assets/angular/omero';
      }
      if (fs.existsSync(angularDest)) {
        fs.removeSync(angularDest)
      }
      if (fs.existsSync(angularTmpDest)) {
        fs.removeSync(angularTmpDest)
      }
      console.log('OMERO: Copying angular files');
      ncp(angularOrigin, angularDest, function (err) {
        if (err) {
          return console.error(err);
        }
        ncp(angularOrigin, angularTmpDest, function (err) {
          if (err) {
            return console.error(err);
          }
          return cb();
        });
      });
    },
    //If each route middleware do not exist sails.lift will fail during hook.load()
    routes: {
      before: {},
      after: {
        'get /:branding/:portal/ws/omero/projects/:limit?/:offset?': OMEROController.projects,
        'post /:branding/:portal/ws/omero/login': OMEROController.login,
        'post /:branding/:portal/ws/omero/create': OMEROController.create,
        'post /:branding/:portal/ws/omero/link': OMEROController.link,
        'post /:branding/:portal/ws/omero/checkLink': OMEROController.checkLink
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
