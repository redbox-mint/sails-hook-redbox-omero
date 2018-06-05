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
var shared_1 = require("./shared");
var omero_service_1 = require("../omero.service");
var LinkModalWorkspaceField = (function (_super) {
    __extends(LinkModalWorkspaceField, _super);
    function LinkModalWorkspaceField(options, injector) {
        var _this = _super.call(this, options, injector) || this;
        _this.listWorkspaces = new core_1.EventEmitter();
        _this.omeroService = _this.getFromInjector(omero_service_1.OMEROService);
        _this.linkModalTitle = options['linkModalTitle'] || '';
        _this.workspaceDetailsTitle = options['workspaceDetailsTitle'] || '';
        _this.processingLabel = options['processingLabel'] || '';
        _this.processingMessage = options['processingMessage'] || '';
        _this.comparingLabel = options['comparingLabel'] || '';
        _this.statusLabel = options['statusLabel'] || '';
        _this.processingSuccess = options['processingSuccess'] || '';
        _this.processingFail = options['processingFail'] || '';
        _this.closeLabel = options['closeLabel'] || '';
        _this.checks = new shared_1.Checks();
        _this.currentWorkspace = new shared_1.CurrentWorkspace();
        _this.workspaceDefinition = options['workspaceDefinition'] || [];
        _this.checkField = options['checkField'] || '';
        _this.recordMap = options['recordMap'] || [];
        return _this;
    }
    LinkModalWorkspaceField.prototype.registerEvents = function () {
        this.fieldMap['ListWorkspaces'].field['linkModal'].subscribe(this.linkModal.bind(this));
    };
    LinkModalWorkspaceField.prototype.createFormModel = function (valueElem) {
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
    LinkModalWorkspaceField.prototype.setValue = function (value) {
        this.formModel.patchValue(value, { emitEvent: false });
        this.formModel.markAsTouched();
    };
    LinkModalWorkspaceField.prototype.setEmptyValue = function () {
        this.value = [];
        return this.value;
    };
    LinkModalWorkspaceField.prototype.linkModal = function (_a) {
        var _this = this;
        var rdmp = _a.rdmp, workspace = _a.workspace;
        this.currentWorkspace = workspace;
        this.checks.clear();
        jQuery('#linkModal').modal('show');
        this.processing = true;
        this.checks.master = true;
        return this.omeroService.link({
            rdmp: rdmp,
            project: this.currentWorkspace,
            recordMap: this.recordMap
        }).then(function (response) {
            if (!response.status) {
                _this.processingStatus = 'done';
                _this.processingFail = response.error.message;
            }
            else {
                _this.checks.linkCreated = true;
            }
            _this.processing = false;
            _this.listWorkspaces.emit();
        })
            .catch(function (error) {
            _this.processingStatus = 'done';
            _this.processingFail = error.error.message;
            _this.processing = false;
        });
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], LinkModalWorkspaceField.prototype, "listWorkspaces", void 0);
    return LinkModalWorkspaceField;
}(field_base_1.FieldBase));
exports.LinkModalWorkspaceField = LinkModalWorkspaceField;
var LinkModalWorkspaceComponent = (function (_super) {
    __extends(LinkModalWorkspaceComponent, _super);
    function LinkModalWorkspaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LinkModalWorkspaceComponent.prototype.ngOnInit = function () {
        this.field.registerEvents();
    };
    LinkModalWorkspaceComponent = __decorate([
        core_1.Component({
            selector: 'ws-linkmodal',
            template: "\n  <div id=\"linkModal\" class=\"modal fade\" data-keyboard=\"false\">\n    <div class=\"modal-dialog\" role=\"document\">\n      <div class=\"modal-content\">\n        <div class=\"modal-header\">\n          <h4 class=\"modal-title\">{{ field.linkModalTitle }}</h4>\n        </div>\n        <div class=\"modal-body\">\n          <h5>{{ field.workspaceDetailsTitle }}</h5>\n          <p *ngFor=\"let item of field.workspaceDefinition\">{{ item.label }} : {{ field.currentWorkspace[item.name] }}</p>\n          <h5>{{ field.processingLabel }}</h5>\n          <p>{{ field.processingMessage }}&nbsp;<span *ngIf=\"field.checks.master; then isDone; else isSpinning\"></span></p>\n          <p *ngIf=\"field.checks.comparing\">{{ field.comparingLabel }}&nbsp;<span *ngIf=\"field.checks.link; then isDone; else isSpinning\"></span></p>\n          <p *ngIf=\"field.checks.link == false\">{{ field.statusLabel }}&nbsp;<span *ngIf=\"field.checks.rdmp; then isDone; else isSpinning\"></span></p>\n          <p class=\"alert alert-success\" *ngIf=\"field.checks.linkCreated\">{{ field.processingSuccess }}</p>\n          <p class=\"alert alert-danger\" *ngIf=\"field.checks.linkWithOther\">{{ field.processingFail }}</p>\n          <p class=\"alert alert-danger\" *ngIf=\"field.processingStatus === 'done' && field.processingFail\">{{ field.processingFail }}</p>\n          <ng-template #isDone>\n            <i class=\"fa fa-check-circle\"></i>\n          </ng-template>\n          <ng-template #isSpinning>\n            <i class=\"fa fa-spinner fa-spin\"></i>\n          </ng-template>\n        </div>\n        <div class=\"modal-footer\">\n          <span *ngIf=\"field.processing; then waitForProcessing; else finishProcessing\"></span>\n          <ng-template #finishProcessing>\n            <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">{{ field.closeLabel }}</button>\n          </ng-template>\n          <ng-template #waitForProcessing>\n            <button type=\"button\" class=\"btn btn-secondary disabled\" data-dismiss=\"modal\">{{ field.closeLabel }}</button>\n          </ng-template>\n        </div>\n      </div>\n    </div>\n  </div>\n  "
        })
    ], LinkModalWorkspaceComponent);
    return LinkModalWorkspaceComponent;
}(field_simple_component_1.SimpleComponent));
exports.LinkModalWorkspaceComponent = LinkModalWorkspaceComponent;
