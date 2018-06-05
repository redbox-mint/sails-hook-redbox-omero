module.exports.workflow = {
  "omero": {
    "draft": {
      config: {
        workflow: {
          stage: 'draft',
          stageLabel: 'Draft',
        },
        authorization: {
          viewRoles: ['Admin', 'Librarians'],
          editRoles: ['Admin', 'Librarians']
        },
        form: 'omero-1.0-draft'
      },
      starting: true
    }
  }
}
