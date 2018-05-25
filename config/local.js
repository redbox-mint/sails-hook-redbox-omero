/**
 * Local related configuration
 */
module.exports = {
  workspaces: {
    provisionerUser: 'admin',
    parentRecord: 'rdmp',
    github: {
      parentRecord: 'rdmp',
      formName: 'github-1.0-draft',
      workflowStage: 'draft',
      appName: 'github',
      appId: 'git-test',
      recordType: 'github',
      host: 'https://github.com',
    }
  }
};
