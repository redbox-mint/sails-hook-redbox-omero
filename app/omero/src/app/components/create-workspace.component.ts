import { Input, Output, Component, OnInit, Inject, Injector, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { SimpleComponent } from '../shared/form/field-simple.component';
import { FieldBase } from '../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-es";

import { OMEROService } from '../omero.service';
import { Creation, CreationAlert, Checks, CurrentWorkspace, WorkspaceUser } from './shared';

// STEST-22
declare var jQuery: any;

/**
* Contributor Model
*
* @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
*
*/
export class CreateWorkspaceField extends FieldBase<any> {

  showHeader: boolean;
  loggedIn: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  createLabel: string;
  dismissLabel: string;
  createWorkspaceLabel: string;
  workspaceDetailsLabel: string;
  selectSpace: string;
  nameWorkspace: string;
  addDescription: string;
  selectTemplate: string;
  nameWorkspaceValidation: string;
  nameHasSpacesValidation: string;
  descriptionWorkspaceValidation: string;
  workspaceCreated: string;
  linkingWorkspace: string;
  creatingWorkspace: string;

  validations: any[];
  loadingModal: boolean;

  checks: Checks;
  creation: Creation;
  creationAlert: CreationAlert;
  processing: boolean = false;
  currentWorkspace: CurrentWorkspace;
  workspaceUser: WorkspaceUser;

  omeroService: OMEROService;
  rdmp: string;
  recordMap: any[];
  branch: string;

  @Output() listWorkspaces: EventEmitter<any> = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
    this.omeroService = this.getFromInjector(OMEROService);
    this.checks = new Checks();
    this.currentWorkspace = new CurrentWorkspace();
    this.workspaceUser = new WorkspaceUser();
    this.creation = new Creation();
    this.creationAlert = new CreationAlert();
    this.createLabel = options['createLabel'] || '';
    this.dismissLabel = options['dismissLabel'] || '';
    this.createWorkspaceLabel = options['createWorkspaceLabel'] || '';
    this.workspaceDetailsLabel = options['workspaceDetailsLabel'] || '';
    this.selectSpace = options['selectSpace'] || '';
    this.nameWorkspace = options['nameWorkspace'] || '';
    this.addDescription = options['addDescription'] || '';
    this.selectTemplate = options['selectTemplate'] || '';
    this.recordMap = options['recordMap'] || [];
    this.branch = options['branch'] || '';
    this.nameWorkspaceValidation = options['nameWorkspaceValidation'] || '';
    this.nameHasSpacesValidation = options['nameHasSpacesValidation'] || '';
    this.descriptionWorkspaceValidation = options['descriptionWorkspaceValidation'] || '';
    this.workspaceCreated = options['workspaceCreated'] || '';
    this.linkingWorkspace = options['linkingWorkspace'] || '';
    this.creatingWorkspace = options['creatingWorkspace'] || '';
  }

  init() {
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  registerEvents() {
    this.fieldMap['ListWorkspaces'].field['checkLoggedIn'].subscribe(this.checkLogin.bind(this));
  }

  checkLogin(status: boolean) {
    this.loggedIn = this.fieldMap._rootComp.loggedIn = status;
  }

  createFormModel(valueElem: any = undefined): any {
    if (valueElem) {
      this.value = valueElem;
    }

    this.formModel = new FormControl(this.value || []);

    if (this.value) {
      this.setValue(this.value);
    }

    return this.formModel;
  }

  setValue(value:any) {
    this.formModel.patchValue(value, {emitEvent: false });
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  loadCreateWorkspaceModal() {
    this.workspaceUser = this.fieldMap._rootComp.workspaceUser;
    this.creation.clear();
    this.creationAlert.clear();
    console.log('clear');
    jQuery('#createModal').modal({show: true, keyboard: false});
  }

  create() {
    this.validations = this.validateWorkspace();
    this.creationAlert.clear();
    if(this.validations.length <= 0) {
        this.createWorkspace();
    }
  }

  validateWorkspace() {
    const validateWorkspace = [];
    if(!this.creation.name) {
      validateWorkspace.push({message: this.nameWorkspaceValidation});
    }
    if(this.creation.nameHasSpaces()) {
      validateWorkspace.push({message: this.nameHasSpacesValidation});
    }
    // if(!this.creation.description) {
    //   validateWorkspace.push({message: this.descriptionWorkspaceValidation});
    // }
    return validateWorkspace;
  }

  createWorkspace() {
    this.creationAlert.set({message: this.creatingWorkspace, status: 'working', className: 'warning'});
    this.omeroService.createWorkspace(this.creation)
    .then(response => {
      if(!response.status) {
        //TODO: improve this assignment in case of error.
        const name = response.message.error.error.message.name || '';
        throw new Error('Name ' + _.first(name));
      } else {
        this.creationAlert.set({message: this.linkingWorkspace, status: 'working', className: 'warning'});
        this.creation.id = response.create['id'];
        return this.omeroService.link({
          rdmp: this.rdmp, project: this.creation, recordMap: this.recordMap
        })
      }
    }).then(response => {
      if(!response.status) {
        throw new Error(response.message.description);
      }
      this.creationAlert.set({message: this.workspaceCreated, status: 'done', className: 'success'});
      this.listWorkspaces.emit();
    })
    .catch(error => {
      this.creationAlert.set({message: error, status: 'error', className: 'danger'});
    });
  }

}

/**
* Component that CreateModal to a workspace app
*/
@Component({
  selector: 'ws-createworkspace',
  templateUrl: './field-createworkspace.html'
})
export class CreateWorkspaceComponent extends SimpleComponent {
  field: CreateWorkspaceField;

  ngOnInit() {
    this.field.init();
    this.field.registerEvents();
  }
}
