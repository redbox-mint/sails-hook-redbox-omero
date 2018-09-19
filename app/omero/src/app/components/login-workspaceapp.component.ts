import {Output, EventEmitter, Component, OnInit, Inject, Injector} from '@angular/core';
import {FormGroup, FormControl, Validators, NgForm} from '@angular/forms';
import {SimpleComponent} from '../shared/form/field-simple.component';
import {FieldBase} from '../shared/form/field-base';
import * as _ from "lodash-es";

// STEST-22
declare var jQuery: any;

import {OMEROService} from '../omero.service';

/**
 * Contributor Model
 *
 * @author <a target='_' href='https://github.com/moisbo'>moisbo</a>
 *
 */
export class LoginWorkspaceAppField extends FieldBase<any> {

  showHeader: boolean;
  loggedIn: boolean;
  isLoaded: boolean;
  validators: any;
  enabledValidators: boolean;
  hasInit: boolean;
  columns: object[];
  usernameLabel: string;
  passwordLabel: string;
  loginLabel: string;
  loginErrorMessage: string;
  loginError: boolean;
  permissionStep: string;
  permissionLabel: string;
  permissionList: object[];
  allowLabel: string;
  closeLabel: string;
  cannotLoginMessage: string;
  loading: boolean;

  omeroService: OMEROService;
  @Output() listWorkspaces: EventEmitter<any> = new EventEmitter<any>();

  constructor(options: any, injector: any) {
    super(options, injector);
    this.omeroService = this.getFromInjector(OMEROService);
    this.columns = options['columns'] || [];
    this.usernameLabel = options['usernameLabel'] || 'username';
    this.passwordLabel = options['passwordLabel'] || 'password';
    this.loginLabel = options['loginLabel'] || 'login';
    this.loginErrorMessage = options['loginErrorMessage'] || 'Please include username and password';
    this.permissionStep = options['permissionStep'] || '';
    this.permissionList = options['permissionList'] || {};
    this.permissionLabel = options['permissionLabel'] || '';
    this.allowLabel = options['allowLabel'] || 'Allow';
    this.closeLabel = options['closeLabel'] || 'Close';
    this.cannotLoginMessage = options['cannotLoginMessage'] || 'There was a problem login in, please try again'
  }

  registerEvents() {
    this.fieldMap['ListWorkspaces'].field['checkLoggedIn'].subscribe(this.checkLogin.bind(this));
    //let that = this;
    //this.fieldMap._rootComp['loginMessage'].subscribe(that.displayLoginMessage);
  }

  revoke() {
    this.checkLogin(false);
  }

  checkLogin(status: boolean) {
    this.loggedIn = this.fieldMap._rootComp.loggedIn = status;
    this.isLoaded = true
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

  validate(form: any) {
    if (form.username && form.password) {
      jQuery('#loginPermissionModal').modal('show');
    } else {
      this.loginError = true;
    }
  }

  allow(form: any) {
    //this.loginSubmitted.emit(userForm);
    jQuery('#loginPermissionModal').modal('hide');
    const formValues = {
      username: form.username,
      password: form.password
    };
    this.loading = true;
    this.omeroService.session(formValues).then((response: any) => {
      this.loading = false;
      if (!response.status) {
        if (!response.message) {
          this.displayLoginMessage({error: true, value: this.cannotLoginMessage});
        } else {
          this.displayLoginMessage({error: true, value: response.message});
        }
        this.loggedIn = false;
      } else {
        this.displayLoginMessage({error: false, value: ''});
        this.listWorkspaces.emit();
      }
    });
  }

  displayLoginMessage(message: any) {
    this.loginError = message.error;
    this.loginErrorMessage = message.value;
  }

}


/**
 * Component that log's in to a workspace app
 *
 */
@Component({
  selector: 'ws-login',
  template: `
    <div *ngIf="field.loading" class="">
      <img class="center-block" src="/images/loading.svg">
    </div>
    <div *ngIf="!field.loggedIn && field.isLoaded && !field.loading" class="padding-bottom-10">
      <div class="">
        <h4>{{ field.permissionStep }}</h4>
        <form #form="ngForm" novalidate autocomplete="off">
          <div class="form-group">
            <label>{{ field.usernameLabel }}</label>
            <input type="text" class="form-control" name="username" ngModel attr.aria-label="{{ field.usernameLabel }}">
          </div>
          <div class="form-group">
            <label>{{ field.passwordLabel }}</label>
            <input type="password" class="form-control" name="password" ngModel attr.aria-label="{{ field.passwordLabel }}">
          </div>
          <button (click)="field.validate(form.value)" class="btn btn-primary"
                  type="submit">{{ field.loginLabel }}
          </button>
          <div class="row"><br/></div>
          <div class="alert alert-danger" *ngIf="field.loginError">
            {{field.loginErrorMessage}}
          </div>
        </form>
      </div>
      <div id="loginPermissionModal" class="modal fade">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">{{ field.permissionLabel }}</h4>
            </div>
            <div class="modal-body">
              <p>{{ field.permissionStep }}</p>
              <ul>
                <li *ngFor="let permission of field.permissionList">{{ permission }}</li>
              </ul>
            </div>
            <div class="modal-footer">
              <button autofocus tabindex="1" type="button" class="btn btn-primary" (click)="field.allow(form.value)">{{ field.allowLabel }}
              </button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ field.closeLabel }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginWorkspaceAppComponent extends SimpleComponent {
  field: LoginWorkspaceAppField;

  ngOnInit() {
    this.field.registerEvents();
  }

}
