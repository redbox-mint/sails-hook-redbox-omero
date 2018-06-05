"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var field_simple_component_1 = require("../../shared/form/field-simple.component");
var field_base_1 = require("../../shared/form/field-base");
var omero_service_1 = require("../omero.service");
var LoginWorkspaceAppField = (function (_super) {
    __extends(LoginWorkspaceAppField, _super);
    function LoginWorkspaceAppField(options, injector) {
        var _this = _super.call(this, options, injector) || this;
        _this.listWorkspaces = new core_1.EventEmitter();
        _this.omeroService = _this.getFromInjector(omero_service_1.OMEROService);
        _this.columns = options['columns'] || [];
        _this.usernameLabel = options['usernameLabel'] || 'username';
        _this.passwordLabel = options['passwordLabel'] || 'password';
        _this.loginLabel = options['loginLabel'] || 'login';
        _this.loginErrorMessage = options['loginErrorMessage'] || 'Please include username and password';
        _this.permissionStep = options['permissionStep'] || '';
        _this.permissionList = options['permissionList'] || {};
        _this.permissionLabel = options['permissionLabel'] || '';
        _this.allowLabel = options['allowLabel'] || 'Allow';
        _this.closeLabel = options['closeLabel'] || 'Close';
        return _this;
    }
    LoginWorkspaceAppField.prototype.registerEvents = function () {
        this.fieldMap['ListWorkspaces'].field['checkLoggedIn'].subscribe(this.checkLogin.bind(this));
    };
    LoginWorkspaceAppField.prototype.revoke = function () {
        this.checkLogin(false);
    };
    LoginWorkspaceAppField.prototype.checkLogin = function (status) {
        this.loggedIn = this.fieldMap._rootComp.loggedIn = status;
        this.isLoaded = true;
    };
    LoginWorkspaceAppField.prototype.createFormModel = function (valueElem) {
        if (valueElem === void 0) { valueElem = undefined; }
        if (valueElem) {
            this.value = valueElem;
        }
        this.formModel = new forms_1.FormControl(this.value || []);
        if (this.value) {
            this.setValue(this.value);
        }
        return this.formModel;
    };
    LoginWorkspaceAppField.prototype.setValue = function (value) {
        this.formModel.patchValue(value, { emitEvent: false });
        this.formModel.markAsTouched();
    };
    LoginWorkspaceAppField.prototype.setEmptyValue = function () {
        this.value = [];
        return this.value;
    };
    LoginWorkspaceAppField.prototype.validate = function (value) {
        if (value.username && value.password) {
            jQuery('#loginPermissionModal').modal('show');
        }
        else {
            this.loginError = true;
        }
    };
    LoginWorkspaceAppField.prototype.allow = function (value) {
        var _this = this;
        jQuery('#loginPermissionModal').modal('hide');
        this.omeroService.session(value).then(function (response) {
            if (!response.status) {
                _this.displayLoginMessage({ error: true, value: response.error.error_description });
                _this.loggedIn = false;
            }
            else {
                _this.displayLoginMessage({ error: false, value: '' });
                _this.listWorkspaces.emit();
            }
        });
    };
    LoginWorkspaceAppField.prototype.displayLoginMessage = function (message) {
        this.loginError = message.error;
        this.loginErrorMessage = message.value;
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LoginWorkspaceAppField.prototype, "listWorkspaces", void 0);
    return LoginWorkspaceAppField;
}(field_base_1.FieldBase));
exports.LoginWorkspaceAppField = LoginWorkspaceAppField;
var LoginWorkspaceAppComponent = (function (_super) {
    __extends(LoginWorkspaceAppComponent, _super);
    function LoginWorkspaceAppComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoginWorkspaceAppComponent.prototype.ngOnInit = function () {
        this.field.registerEvents();
    };
    LoginWorkspaceAppComponent = __decorate([
        core_1.Component({
            selector: 'ws-login',
            template: "\n  <div *ngIf=\"!field.loggedIn && field.isLoaded\" class=\"padding-bottom-10\">\n    <div class=\"\">\n      <h4>{{ field.permissionStep }}</h4>\n      <form #form=\"ngForm\"  novalidate autocomplete=\"off\">\n        <div class=\"form-group\">\n          <label>{{ field.usernameLabel }}</label>\n          <input type=\"text\" class=\"form-control\" name=\"username\" ngModel>\n        </div>\n        <div class=\"form-group\">\n          <label>{{ field.passwordLabel }}</label>\n          <input type=\"password\" class=\"form-control\" name=\"password\" ngModel>\n        </div>\n        <button (click)=\"field.validate(form.value)\" class=\"btn btn-primary\"\n        type=\"submit\">{{ field.loginLabel }}</button>\n        <div class=\"row\"><br/></div>\n        <div class=\"alert alert-danger\" *ngIf=\"field.loginError\">\n          {{field.loginErrorMessage}}\n        </div>\n      </form>\n    </div>\n    <div id=\"loginPermissionModal\" class=\"modal fade\">\n      <div class=\"modal-dialog\" role=\"document\">\n        <div class=\"modal-content\">\n          <div class=\"modal-header\">\n            <h4 class=\"modal-title\">{{ field.permissionLabel }}</h4>\n          </div>\n          <div class=\"modal-body\">\n          <p>{{ field.permissionStep }}</p>\n          <ul>\n            <li *ngFor=\"let permission of field.permissionList\">{{ permission }}</li>\n          </ul>\n          </div>\n          <div class=\"modal-footer\">\n            <button type=\"button\" class=\"btn btn-primary\" (click)=\"field.allow(form.value)\">{{ field.allowLabel }}</button>\n            <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">{{ field.closeLabel }}</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "
        })
    ], LoginWorkspaceAppComponent);
    return LoginWorkspaceAppComponent;
}(field_simple_component_1.SimpleComponent));
exports.LoginWorkspaceAppComponent = LoginWorkspaceAppComponent;
