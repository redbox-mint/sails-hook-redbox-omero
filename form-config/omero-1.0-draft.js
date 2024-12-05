/**
 * OMERO form
 */
module.exports.form = {
  forms: {
    'omero-1.0-draft': {
      name: 'omero-1.0-draft',
      type: 'omero',
      customAngularApp: {
        appName: 'omero',
        appSelector: 'omero-form'
      },
      skipValidationOnSave: true,
      editCssClasses: 'row col-md-12',
      viewCssClasses: 'row col-md-offset-1 col-md-10',
      messages: {
        "saving": ["@dmpt-form-saving"],
        "validationFail": ["@dmpt-form-validation-fail-prefix", "@dmpt-form-validation-fail-suffix"],
        "saveSuccess": ["@dmpt-form-save-success"],
        "saveError": ["@dmpt-form-save-error"]
      },
      fields: [
        {
          class: 'Container',
          compClass: 'TextBlockComponent',
          viewOnly: false,
          definition: {
            value: 'OMERO',
            type: 'h2'
          }
        },
        {
          class: 'Container',
          compClass: 'TextBlockComponent',
          viewOnly: false,
          definition: {
            value: 'Workspaces',
            type: 'h3'
          }
        },
        {
          class: 'ListWorkspaceDataField',
          showHeader: true,
          definition: {
            name: 'ListWorkspaces',
            columns: [
              {'label': 'Name', 'property': 'Name'},
              {'label': 'Description', 'property': 'Description'},
              {'label': 'Location', 'property': '@id', 'link': 'true',
                'classes': 'btn btn-primary', 'label': 'Open'}
            ],
            rdmpLinkLabel: 'Plan',
            syncLabel: 'Sync',
            linkedLabel: 'Linked',
            linkedAnotherLabel: 'Linked to another RDMP',
            linkLabel: 'Link Workspace',
            linkProblem: 'There was a problem checking the link',
            workspaceLink: '/webclient/?show=project-'
            // subscribe: {
            //   'LoginWorkspaceApp': {
            //     listWorkspaces: [{
            //       action: 'listWorkspaces'
            //     }]
            //   }
            // },
          }
        },
        {
          class: 'LinkModalWorkspaceField',
          showHeader: true,
          definition: {
            name: 'LinkModal',
            workspaceDefinition: [
              {label: 'Name', name: 'Name'},
              {label: 'Description', name: 'Description'}
            ],
            recordMap: [
              {record: 'title', ele: 'Name'},
              {record: 'omeroId', ele: '@id'},
              {record: 'description', ele: 'Description'},
              {record: 'location', ele: 'location'},
              {record: 'dataset', ele: 'url:dataset'}
            ],
            workspaceLink: '/webclient/?show=project-',
            checkField: 'name_with_namespace',
            checkBranch: 'master',
            linkModalTitle: 'Workspace Linking',
            workspaceDetailsTitle: 'Workspace Details',
            processingLabel: 'Processing Link',
            processingMessage: 'Checking your master workspace link ...',
            comparingLabel: 'Checking current links ...',
            statusLabel: 'No links, Linking to workspace ...',
            processingSuccess: 'Your workspace was linked succesfully',
            processingFail: 'Your workspace is linked with another RDMP',
            closeLabel: 'Close'
          }
        },
        {
          class: 'CreateWorkspaceField',
          showHeader: true,
          definition: {
            name: 'CreateWorkspace',
            recordMap: [
              {record: 'title', ele: 'name'},
              {record: 'omeroId', ele: 'id'},
              {record: 'description', ele: 'description'},
              {record: 'location', ele: 'location'},
              {record: 'dataset', ele: 'url:dataset'}
            ],
            workspaceLink: '/webclient/?show=project-',
            branch: 'master',
            createLabel: 'Create',
            dismissLabel: 'Close',
            createWorkspaceLabel: 'Create Workspace (no spaces allowed*)',
            workspaceDetailsLabel: 'Workspace Details',
            selectSpace: 'Select Space',
            nameWorkspace: 'Name your workspace (no spaces allowed*)',
            nameHasSpacesValidation: 'Name should not include spaces',
            addDescription: 'Add a description',
            selectTemplate: 'Select Template',
            nameWorkspaceValidation: 'Name of the workspace is required',
            descriptionWorkspaceValidation: 'Description of the workspace is required',
            creatingWorkspace: 'Creating Workspace',
            linkingWorkspace: 'Linking Workspace',
            workspaceCreated: 'Workspace Created'
          }
        },
        {
          class: 'LoginWorkspaceAppField',
          showHeader: true,
          definition: {
            name: 'LoginWorkspaceApp',
            usernameLabel: 'username',
            passwordLabel: 'password',
            loginLabel: 'Login',
            permissionStep: 'Stash is requesting from OMERO the following permissions:',
            permissionList: [
              'Create Repositories',
              'Write information into your repositories'
            ],
            allowLabel: 'Allow',
            closeLabel: 'Close',
            loginErrorMessage: 'Please include username and password',
            cannotLoginMessage: 'There was a problem login in, please try again'
          }
        },
        {
          class: "AnchorOrButton",
          viewOnly: false,
          definition: {
            name: "BackToPlan",
            label: 'Back to your Plan',
            value: '/@branding/@portal/record/edit/',
            cssClasses: 'btn btn-large btn-info',
            showPencil: false,
            controlType: 'anchor'
          },
          variableSubstitutionFields: ['value']
        }
      ]
    }
  }
}
