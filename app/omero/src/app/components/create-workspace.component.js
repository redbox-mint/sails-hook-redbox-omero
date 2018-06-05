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
var _ = require("lodash-lib");
var omero_service_1 = require("../omero.service");
var shared_1 = require("./shared");
var CreateWorkspaceField = (function (_super) {
    __extends(CreateWorkspaceField, _super);
    function CreateWorkspaceField(options, injector) {
        var _this = _super.call(this, options, injector) || this;
        _this.processing = false;
        _this.listWorkspaces = new core_1.EventEmitter();
        _this.omeroService = _this.getFromInjector(omero_service_1.OMEROService);
        _this.checks = new shared_1.Checks();
        _this.currentWorkspace = new shared_1.CurrentWorkspace();
        _this.workspaceUser = new shared_1.WorkspaceUser();
        _this.creation = new shared_1.Creation();
        _this.creationAlert = new shared_1.CreationAlert();
        _this.createLabel = options['createLabel'] || '';
        _this.dismissLabel = options['dismissLabel'] || '';
        _this.createWorkspaceLabel = options['createWorkspaceLabel'] || '';
        _this.workspaceDetailsLabel = options['workspaceDetailsLabel'] || '';
        _this.selectSpace = options['selectSpace'] || '';
        _this.nameWorkspace = options['nameWorkspace'] || '';
        _this.addDescription = options['addDescription'] || '';
        _this.selectTemplate = options['selectTemplate'] || '';
        _this.recordMap = options['recordMap'] || [];
        _this.branch = options['branch'] || '';
        _this.nameWorkspaceValidation = options['nameWorkspaceValidation'] || '';
        _this.nameHasSpacesValidation = options['nameHasSpacesValidation'] || '';
        _this.descriptionWorkspaceValidation = options['descriptionWorkspaceValidation'] || '';
        _this.workspaceCreated = options['workspaceCreated'] || '';
        _this.linkingWorkspace = options['linkingWorkspace'] || '';
        _this.creatingWorkspace = options['creatingWorkspace'] || '';
        return _this;
    }
    CreateWorkspaceField.prototype.init = function () {
        this.rdmp = this.fieldMap._rootComp.rdmp;
    };
    CreateWorkspaceField.prototype.registerEvents = function () {
        this.fieldMap['ListWorkspaces'].field['checkLoggedIn'].subscribe(this.checkLogin.bind(this));
    };
    CreateWorkspaceField.prototype.checkLogin = function (status) {
        this.loggedIn = this.fieldMap._rootComp.loggedIn = status;
    };
    CreateWorkspaceField.prototype.createFormModel = function (valueElem) {
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
    CreateWorkspaceField.prototype.setValue = function (value) {
        this.formModel.patchValue(value, { emitEvent: false });
        this.formModel.markAsTouched();
    };
    CreateWorkspaceField.prototype.setEmptyValue = function () {
        this.value = [];
        return this.value;
    };
    CreateWorkspaceField.prototype.loadCreateWorkspaceModal = function () {
        this.workspaceUser = this.fieldMap._rootComp.workspaceUser;
        this.loadingModal = true;
        this.creation.clear();
        jQuery('#createModal').modal({ show: true, keyboard: false });
    };
    CreateWorkspaceField.prototype.create = function () {
        this.validations = this.validateWorkspace();
        this.creationAlert.clear();
        if (this.validations.length <= 0) {
            this.createWorkspace();
        }
    };
    CreateWorkspaceField.prototype.validateWorkspace = function () {
        var validateWorkspace = [];
        if (!this.creation.name) {
            validateWorkspace.push({ message: this.nameWorkspaceValidation });
        }
        if (this.creation.nameHasSpaces()) {
            validateWorkspace.push({ message: this.nameHasSpacesValidation });
        }
        if (!this.creation.description) {
            validateWorkspace.push({ message: this.descriptionWorkspaceValidation });
        }
        return validateWorkspace;
    };
    CreateWorkspaceField.prototype.createWorkspace = function () {
        var _this = this;
        this.creationAlert.set({ message: this.creatingWorkspace, status: 'working', className: 'warning' });
        this.omeroService.createWorkspace(this.creation)
            .then(function (response) {
            if (!response.status) {
                var name_1 = response.message.error.error.message.name || '';
                throw new Error('Name ' + _.first(name_1));
            }
            else {
                _this.creationAlert.set({ message: _this.linkingWorkspace, status: 'working', className: 'warning' });
                _this.creation.id = response.create['id'];
                return _this.omeroService.link({
                    rdmp: _this.rdmp, project: _this.creation, recordMap: _this.recordMap
                });
            }
        }).then(function (response) {
            if (!response.status) {
                throw new Error(response.message.description);
            }
            _this.creationAlert.set({ message: _this.workspaceCreated, status: 'done', className: 'success' });
            _this.listWorkspaces.emit();
        })
            .catch(function (error) {
            _this.creationAlert.set({ message: error, status: 'error', className: 'danger' });
        });
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], CreateWorkspaceField.prototype, "listWorkspaces", void 0);
    return CreateWorkspaceField;
}(field_base_1.FieldBase));
exports.CreateWorkspaceField = CreateWorkspaceField;
var createModalWorkspaceTemplate = './field-createworkspace.html';
if (typeof aotMode == 'undefined') {
    createModalWorkspaceTemplate = '../angular/omero/components/field-createworkspace.html';
}
var CreateWorkspaceComponent = (function (_super) {
    __extends(CreateWorkspaceComponent, _super);
    function CreateWorkspaceComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreateWorkspaceComponent.prototype.ngOnInit = function () {
        this.field.init();
        this.field.registerEvents();
    };
    CreateWorkspaceComponent = __decorate([
        core_1.Component({
            selector: 'ws-createworkspace',
            templateUrl: createModalWorkspaceTemplate
        })
    ], CreateWorkspaceComponent);
    return CreateWorkspaceComponent;
}(field_simple_component_1.SimpleComponent));
exports.CreateWorkspaceComponent = CreateWorkspaceComponent;
