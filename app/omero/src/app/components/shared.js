"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WorkspaceUser = (function () {
    function WorkspaceUser() {
    }
    return WorkspaceUser;
}());
exports.WorkspaceUser = WorkspaceUser;
var Checks = (function () {
    function Checks() {
        this.link = undefined;
        this.rdmp = false;
        this.linkCreated = false;
        this.linkWithOther = false;
        this.master = false;
        this.comparing = false;
    }
    Checks.prototype.clear = function () {
        this.linkCreated = false;
        this.linkWithOther = false;
    };
    return Checks;
}());
exports.Checks = Checks;
var CurrentWorkspace = (function () {
    function CurrentWorkspace() {
        this.path_with_namespace = '';
        this.web_url = '';
    }
    return CurrentWorkspace;
}());
exports.CurrentWorkspace = CurrentWorkspace;
var Creation = (function () {
    function Creation() {
        this.created = false;
        this.name = '';
        this.blank = true;
        this.description = '';
    }
    Creation.prototype.clear = function () {
        this.description = '';
        this.name = '';
        this.id = '';
    };
    Creation.prototype.nameHasSpaces = function () {
        return /\s/g.test(this.name);
    };
    return Creation;
}());
exports.Creation = Creation;
var CreationAlert = (function () {
    function CreationAlert() {
        this.message = '';
        this.className = 'danger';
        this.status = '';
    }
    CreationAlert.prototype.set = function (_a) {
        var message = _a.message, status = _a.status, className = _a.className;
        this.message = message;
        this.status = status;
        this.className = className;
    };
    CreationAlert.prototype.clear = function () {
        this.message = '';
        this.className = 'danger';
        this.status = '';
    };
    return CreationAlert;
}());
exports.CreationAlert = CreationAlert;
var CurrentWorkspace = (function () {
    function CurrentWorkspace() {
        this.path_with_namespace = '';
        this.web_url = '';
    }
    return CurrentWorkspace;
}());
exports.CurrentWorkspace = CurrentWorkspace;
var WorkspaceUser = (function () {
    function WorkspaceUser() {
    }
    return WorkspaceUser;
}());
exports.WorkspaceUser = WorkspaceUser;
