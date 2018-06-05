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
var field_simple_component_1 = require("../../shared/form/field-simple.component");
var field_base_1 = require("../../shared/form/field-base");
var forms_1 = require("@angular/forms");
var omero_service_1 = require("../omero.service");
var ListWorkspaceDataField = (function (_super) {
    __extends(ListWorkspaceDataField, _super);
    function ListWorkspaceDataField(options, injector) {
        var _this = _super.call(this, options, injector) || this;
        _this.checkLoggedIn = new core_1.EventEmitter();
        _this.linkModal = new core_1.EventEmitter();
        _this.setWorkspaceUser = new core_1.EventEmitter();
        _this.omeroService = _this.getFromInjector(omero_service_1.OMEROService);
        _this.relatedObjects = [];
        _this.accessDeniedObjects = [];
        _this.failedObjects = [];
        _this.columns = options['columns'] || [];
        _this.rdmpLinkLabel = options['rdmpLinkLabel'] || 'Plan';
        _this.syncLabel = options['syncLabel'] || 'Sync';
        var relatedObjects = _this.relatedObjects;
        _this.value = options['value'] || _this.setEmptyValue();
        _this.relatedObjects = [];
        _this.failedObjects = [];
        _this.accessDeniedObjects = [];
        _this.loading = true;
        _this.workspaceLink = options['workspaceLink'];
        return _this;
    }
    ListWorkspaceDataField.prototype.registerEvents = function () {
        this.fieldMap['LoginWorkspaceApp'].field['listWorkspaces'].subscribe(this.listWorkspaces.bind(this));
    };
    ListWorkspaceDataField.prototype.init = function () {
        this.rdmp = this.fieldMap._rootComp.rdmp;
    };
    ListWorkspaceDataField.prototype.revoke = function () {
        this.loggedIn = false;
    };
    ListWorkspaceDataField.prototype.createFormModel = function (valueElem) {
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
    ListWorkspaceDataField.prototype.setValue = function (value) {
        this.formModel.patchValue(value, { emitEvent: false });
        this.formModel.markAsTouched();
    };
    ListWorkspaceDataField.prototype.setEmptyValue = function () {
        this.value = [];
        return this.value;
    };
    ListWorkspaceDataField.prototype.listWorkspaces = function () {
        var _this = this;
        this.loading = true;
        this.workspaces = [];
        return this.omeroService.projects()
            .then(function (response) {
            _this.loading = false;
            if (!response.status) {
                _this.loggedIn = _this.fieldMap._rootComp.loggedIn = false;
                _this.checkLoggedIn.emit(false);
            }
            else {
                _this.loggedIn = _this.fieldMap._rootComp.loggedIn = true;
                _this.workspaces = response.projects.data;
                _this.checkLoggedIn.emit(true);
            }
        })
            .catch(function (error) {
            _this.loading = false;
            _this.loggedIn = _this.fieldMap._rootComp.loggedIn = false;
            _this.checkLoggedIn.emit(false);
        });
    };
    ListWorkspaceDataField.prototype.linkWorkspace = function (item) {
        this.linkModal.emit({ rdmp: this.fieldMap._rootComp.rdmp, workspace: item });
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ListWorkspaceDataField.prototype, "checkLoggedIn", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ListWorkspaceDataField.prototype, "linkModal", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], ListWorkspaceDataField.prototype, "setWorkspaceUser", void 0);
    return ListWorkspaceDataField;
}(field_base_1.FieldBase));
exports.ListWorkspaceDataField = ListWorkspaceDataField;
var wsListWorkspaceDataTemplate = './field-listworkspaces.html';
if (typeof aotMode == 'undefined') {
    wsListWorkspaceDataTemplate = '../angular/omero/components/field-listworkspaces.html';
}
var ListWorkspaceDataComponent = (function (_super) {
    __extends(ListWorkspaceDataComponent, _super);
    function ListWorkspaceDataComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListWorkspaceDataComponent.prototype.ngOnInit = function () {
        this.field.registerEvents();
        this.field.init();
    };
    ListWorkspaceDataComponent.prototype.ngAfterContentInit = function () {
        this.field.listWorkspaces();
    };
    ListWorkspaceDataComponent = __decorate([
        core_1.Component({
            selector: 'ws-listworkspaces',
            templateUrl: wsListWorkspaceDataTemplate
        })
    ], ListWorkspaceDataComponent);
    return ListWorkspaceDataComponent;
}(field_simple_component_1.SimpleComponent));
exports.ListWorkspaceDataComponent = ListWorkspaceDataComponent;
