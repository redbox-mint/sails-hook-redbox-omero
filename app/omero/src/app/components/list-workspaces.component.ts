import { Input, Output, Component, OnInit, Inject, Injector, EventEmitter} from '@angular/core';
import { SimpleComponent } from '../shared/form/field-simple.component';
import { FieldBase } from '../shared/form/field-base';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash-es";

import { OMEROService } from '../omero.service';

/**
 * Contributor Model
 *
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
export class ListWorkspaceDataField extends FieldBase<any> {

  showHeader: boolean;
  loggedIn: boolean;
  loading: boolean;
  validators: any;
  enabledValidators: boolean;
  relatedObjects: object[];
  accessDeniedObjects: object[];
  failedObjects: object[];
  hasInit: boolean;
  columns: object[];
  rdmpLinkLabel: string;
  syncLabel: string;
  workspaces: any[];
  user: any;
  omeroService: OMEROService;
  rdmp: string;
  workspaceLink: string;

  @Output() checkLoggedIn: EventEmitter<any> = new EventEmitter<any>();
  @Output() linkModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() setWorkspaceUser: EventEmitter<any> = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
    this.omeroService = this.getFromInjector(OMEROService);
    this.relatedObjects = [];
    this.accessDeniedObjects = [];
    this.failedObjects = [];
    this.columns = options['columns'] || [];
    this.rdmpLinkLabel = options['rdmpLinkLabel'] || 'Plan';
    this.syncLabel = options['syncLabel'] || 'Sync';
    var relatedObjects = this.relatedObjects;
    this.value = options['value'] || this.setEmptyValue();
    this.relatedObjects = [];
    this.failedObjects = [];
    this.accessDeniedObjects = [];
    this.loading = true;
    this.workspaceLink = options['workspaceLink'];
  }

  registerEvents() {
    this.fieldMap['LoginWorkspaceApp'].field['listWorkspaces'].subscribe(this.listWorkspaces.bind(this));    //TODO: this next line doesnt work because of when the form is being built
    // this.fieldMap['CreateWorkspace'].field['listWorkspaces'].subscribe(this.listWorkspaces.bind(this));
    // this.fieldMap['LinkModal'].field['listWorkspaces'].subscribe(this.listWorkspaces.bind(this));
    // this.fieldMap['RevokeLogin'].field['revokePermissions'].subscribe(this.revoke.bind(this));
  }

  init(){
    this.rdmp = this.fieldMap._rootComp.rdmp;
  }

  revoke() {
    this.loggedIn = false;
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

  listWorkspaces() {
    this.loading = true;
    this.workspaces = [];
    return this.omeroService.projects()
    .then(response => {
      this.loading = false;
      if(!response.status) {
        this.loggedIn = this.fieldMap._rootComp.loggedIn = false;
        this.checkLoggedIn.emit(false);
      } else {
        this.loggedIn = this.fieldMap._rootComp.loggedIn = true;
        this.workspaces = response.projects.data;
        this.checkLoggedIn.emit(true);
      }
    })
    .catch(error => {
      this.loading = false;
      this.loggedIn = this.fieldMap._rootComp.loggedIn = false;
      this.checkLoggedIn.emit(false);
    });
  }

  linkWorkspace(item) {
    this.linkModal.emit({rdmp: this.fieldMap._rootComp.rdmp, workspace: item});
  }

}

/**
* Component to display information from related objects within ReDBox
*/
@Component({
  selector: 'ws-listworkspaces',
  templateUrl: './field-listworkspaces.html'
})
export class ListWorkspaceDataComponent extends SimpleComponent {
  field: ListWorkspaceDataField;

  ngOnInit() {
    this.field.registerEvents();
    this.field.init();
  }

  ngAfterContentInit() {
    this.field.listWorkspaces();
  }

}
