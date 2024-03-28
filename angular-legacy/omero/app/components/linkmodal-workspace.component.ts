import {Input, Output, Component, OnInit, Inject, Injector, EventEmitter} from '@angular/core';
import {SimpleComponent} from '../../../shared/form/field-simple.component';
import {FieldBase} from '../../../shared/form/field-base';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as _ from "lodash-es";

import {Checks, CurrentWorkspace} from './shared';
import {OMEROService} from '../omero.service';

// STEST-22
declare var jQuery: any;

/**
 * Contributor Model
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
export class LinkModalWorkspaceField extends FieldBase<any> {

  showHeader: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;

  linkModalTitle: string;
  workspaceDetailsTitle: string;
  processingLabel: string;
  processingMessage: string;
  comparingLabel: string;
  statusLabel: string;
  processingSuccess: string;
  processingFail: string;
  closeLabel: string;
  processing: boolean;
  processingStatus: string; //Control status code {'done','async','start'}
  host: string;
  workspaceLink: string;

  omeroService: OMEROService;
  currentWorkspace: CurrentWorkspace;
  workspaceDefinition: any[];
  recordMap: any[];
  checkField: string;
  checkBranch: string;
  checks: Checks;
  linkCreated: boolean;

  @Output() listWorkspaces: EventEmitter<any> = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
    this.omeroService = this.getFromInjector(OMEROService);
    this.linkModalTitle = options['linkModalTitle'] || '';
    this.workspaceDetailsTitle = options['workspaceDetailsTitle'] || '';
    this.processingLabel = options['processingLabel'] || '';
    this.processingMessage = options['processingMessage'] || '';
    this.comparingLabel = options['comparingLabel'] || '';
    this.statusLabel = options['statusLabel'] || '';
    this.processingSuccess = options['processingSuccess'] || '';
    this.processingFail = options['processingFail'] || '';
    this.closeLabel = options['closeLabel'] || '';
    this.checks = new Checks();
    this.currentWorkspace = new CurrentWorkspace();
    this.workspaceDefinition = options['workspaceDefinition'] || [];
    this.checkField = options['checkField'] || '';
    this.recordMap = options['recordMap'] || [];
    this.workspaceLink = options['workspaceLink'] || '';
  }

  registerEvents() {
    this.fieldMap['ListWorkspaces'].field['linkModal'].subscribe(this.linkModal.bind(this));
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

  setValue(value: any) {
    this.formModel.patchValue(value, {emitEvent: false});
    this.formModel.markAsTouched();
  }

  setEmptyValue() {
    this.value = [];
    return this.value;
  }

  linkModal({rdmp, workspace}) {
    this.currentWorkspace = workspace;
    this.checks.clear();
    jQuery('#linkModal').modal({show: true, keyboard: false, backdrop: 'static'});
    jQuery('#linkModal').modal('show');
    this.processing = true;
    this.checks.master = true;
    return this.omeroService.info()
      .then(res => {
        this.host = res.host;
        this.currentWorkspace.location = this.host + this.workspaceLink + workspace['@id'];
        return this.omeroService.link({
          rdmp: rdmp,
          project: this.currentWorkspace,
          recordMap: this.recordMap
        });
      }).then(response => {
        if (!response.status) {
          this.processingStatus = 'done';
          this.processingFail = response.error.message;
        } else {
          this.checks.linkCreated = true;
        }
        this.processing = false;
        this.listWorkspaces.emit();
      })
      .catch(error => {
        this.processingStatus = 'done';
        this.processingFail = error.error.message;
        this.processing = false;
      })
  }
}

/**
 * Component that Links Workspaces to Workspace Records in Stash
 */
@Component({
  selector: 'ws-linkmodal',
  template: `
    <div id="linkModal" class="modal fade" data-keyboard="false">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">{{ field.linkModalTitle }}</h4>
          </div>
          <div class="modal-body">
            <h5>{{ field.workspaceDetailsTitle }}</h5>
            <p *ngFor="let item of field.workspaceDefinition">{{ item.label }} :
              {{ field.currentWorkspace[item.name]}}</p>
            <h5>{{ field.processingLabel }}</h5>
            <p>{{ field.processingMessage }}&nbsp;<span
              *ngIf="field.checks.master; then isDone; else isSpinning"></span></p>
            <p *ngIf="field.checks.comparing">{{ field.comparingLabel }}&nbsp;<span
              *ngIf="field.checks.link; then isDone; else isSpinning"></span></p>
            <p *ngIf="field.checks.link == false">{{ field.statusLabel }}&nbsp;<span
              *ngIf="field.checks.rdmp; then isDone; else isSpinning"></span></p>
            <p class="alert alert-success" *ngIf="field.checks.linkCreated">{{ field.processingSuccess }}</p>
            <p class="alert alert-danger" *ngIf="field.checks.linkWithOther">{{ field.processingFail }}</p>
            <p class="alert alert-danger" *ngIf="field.processingStatus === 'done' && field.processingFail">
              {{ field.processingFail }}</p>
            <ng-template #isDone>
              <i class="fa fa-check-circle"></i>
            </ng-template>
            <ng-template #isSpinning>
              <i class="fa fa-spinner fa-spin"></i>
            </ng-template>
          </div>
          <div class="modal-footer">
            <span *ngIf="field.processing; then waitForProcessing; else finishProcessing"></span>
            <ng-template #finishProcessing>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ field.closeLabel }}</button>
            </ng-template>
            <ng-template #waitForProcessing>
              <button type="button" class="btn btn-secondary disabled" data-bs-dismiss="modal">{{ field.closeLabel }}
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LinkModalWorkspaceComponent extends SimpleComponent {
  field: LinkModalWorkspaceField;

  ngOnInit() {
    this.field.registerEvents();
  }
}
