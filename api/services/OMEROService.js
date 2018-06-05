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
var request = require("request-promise");
var services = require("../core/CoreService.js");
var Services;
(function (Services) {
    var OMEROService = (function (_super) {
        __extends(OMEROService, _super);
        function OMEROService() {
            var _this_1 = _super.call(this) || this;
            _this_1._exportedMethods = [
                'csrf',
                'login',
                'projects',
                'createContainer',
                'annotateMap',
                'annotations'
            ];
            return _this_1;
        }
        OMEROService.prototype.csrf = function (config) {
            var get = request({
                uri: config.host + "/api/v0/token/"
            });
            return Rx_1.Observable.fromPromise(get);
        };
        OMEROService.prototype.login = function (config, csrf, user) {
            var jar = request.jar();
            jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', csrf);
            var post = request({
                uri: config.host + "/api/v0/login/",
                method: 'POST',
                formData: {
                    username: user.username,
                    password: user.password,
                    server: config.serverId
                },
                resolveWithFullResponse: true,
                jar: jar,
                headers: {
                    'X-CSRFToken': csrf
                }
            });
            return Rx_1.Observable.fromPromise(post);
        };
        OMEROService.prototype.projects = function (config, csrf, sessionid, sessionUuid) {
            var jar = request.jar();
            jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', csrf);
            jar = WorkspaceService.cookieJar(jar, config, 'sessionid', sessionid);
            var get = request({
                uri: config.host + "/api/v0/m/projects/",
                jar: jar,
                headers: {
                    'X-CSRFToken': csrf,
                    'sessionUuid': sessionUuid
                }
            });
            return Rx_1.Observable.fromPromise(get);
        };
        OMEROService.prototype.createContainer = function (config, app, project) {
            var jar = request.jar();
            jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = WorkspaceService.cookieJar(jar, config, 'sessionid', app.sessionid);
            var post = request({
                uri: config.host + "/webclient/action/addnewcontainer/",
                method: 'POST',
                jar: jar,
                formData: {
                    name: project.name,
                    folder_type: project.type,
                    description: project.description,
                    owner: project.owner || ''
                },
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return Rx_1.Observable.fromPromise(post);
        };
        OMEROService.prototype.annotateMap = function (_a) {
            var config = _a.config, app = _a.app, id = _a.id, annId = _a.annId, mapAnnotation = _a.mapAnnotation;
            var jar = request.jar();
            jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = WorkspaceService.cookieJar(jar, config, 'sessionid', app.sessionid);
            var formData = {
                project: id,
                mapAnnotation: JSON.stringify(mapAnnotation)
            };
            if (annId) {
                formData['annId'] = annId;
            }
            var post = request({
                uri: config.host + "/webclient/annotate_map/",
                method: 'POST',
                jar: jar,
                formData: formData,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                },
                resolveWithFullResponse: true
            });
            return Rx_1.Observable.fromPromise(post);
        };
        OMEROService.prototype.annotations = function (_a) {
            var config = _a.config, app = _a.app, id = _a.id;
            var jar = request.jar();
            jar = WorkspaceService.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = WorkspaceService.cookieJar(jar, config, 'sessionid', app.sessionid);
            var get = request({
                uri: config.host + "/webclient/api/annotations/?type=map&project=" + id,
                jar: jar,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return Rx_1.Observable.fromPromise(get);
        };
        return OMEROService;
    }(services.Services.Core.Service));
    Services.OMEROService = OMEROService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.OMEROService().exports();
