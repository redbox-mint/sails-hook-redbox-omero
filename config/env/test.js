/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  workspaces: {
    portal:{
      authorization: 'Bearer 123123'
    },
    provisionerUser: 'admin',
    parentRecord: 'rdmp',
    omero: {
      parentRecord: 'rdmp',
      formName: 'omero-1.0-draft',
      workflowStage: 'draft',
      appName: 'omero',
      appId: 'omero-test',
      recordType: 'omero',
      host: 'https://omero-dev.research.uts.edu.au',
      domain: 'omero-dev.research.uts.edu.au',
      serverId: '1',
      defaultGroupId: 1
    }
  }
};
