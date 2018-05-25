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
Object.defineProperty(exports, "__esModule", { value: true });
var url = require('url');
var local = require('../../config/local');
var controller = require("../core/CoreController");
var Controllers;
(function (Controllers) {
    var GithubController = (function (_super) {
        __extends(GithubController, _super);
        function GithubController() {
            var _this = _super.call(this) || this;
            _this._exportedMethods = [
                'projects'
            ];
            return _this;
        }
        GithubController.prototype.projects = function (req, res) {
            var _this = this;
            var username = req.param('username');
            var password = req.param('password');
            sails.services.GithubService.projects(username, password)
                .subscribe(function (response) {
                _this.ajaxOk(req, res, null, { status: true });
            }, function (error) {
                sails.log.error(error);
                var errorMessage = "Failed to get projects for user: " + username;
                sails.log.error(errorMessage);
                _this.ajaxFail(req, res, errorMessage, error);
            });
        };
        return GithubController;
    }(controller.Controllers.Core.Controller));
    Controllers.GithubController = GithubController;
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.GithubController().exports();
