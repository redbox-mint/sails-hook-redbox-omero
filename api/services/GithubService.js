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
var Rx_1 = require("rxjs/Rx");
var services = require("../core/CoreService");
var GitHub = require('github-api');
var Services;
(function (Services) {
    var GithubService = (function (_super) {
        __extends(GithubService, _super);
        function GithubService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._exportedMethods = [
                'projects',
            ];
            return _this;
        }
        GithubService.prototype.projects = function (username, password) {
            var gh = new GitHub({
                username: username,
                password: password
            });
            var user = gh.getUser();
            var filterOpts = {
                type: 'owner',
                sort: 'updated',
                per_page: 10,
                page: 10,
            };
            return Rx_1.Observable.fromPromise(user.listRepos(filterOpts));
        };
        return GithubService;
    }(services.Services.Core.Service));
    Services.GithubService = GithubService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.GithubService().exports();
