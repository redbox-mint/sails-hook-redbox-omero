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
var requestPromise = require("request-promise");
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
                'annotations',
                'getCookies',
                'getCookieValue'
            ];
            return _this_1;
        }
        OMEROService.prototype.cookieJar = function (jar, config, key, value) {
            var keyvalue = key + '=' + value;
            var cookie = requestPromise.cookie('' + keyvalue);
            jar.setCookie(cookie, config.host, function (error, cookie) {
                sails.log.debug(cookie);
            });
            return jar;
        };
        OMEROService.prototype.getCookies = function (cookies) {
            var cookieJar = [];
            cookies.forEach(function (rawcookies) {
                var cookie = requestPromise.cookie(rawcookies);
                cookieJar.push({ key: cookie.key, value: cookie.value, expires: cookie.expires });
            });
            return cookieJar;
        };
        OMEROService.prototype.getCookieValue = function (cookieJar, key) {
            var cookie = _.find(cookieJar, { key: key });
            if (cookie) {
                return cookie['value'];
            }
            else
                return '';
        };
        OMEROService.prototype.csrf = function (config) {
            var get = requestPromise({
                uri: config.host + "/api/v0/token/"
            });
            return Rx_1.Observable.fromPromise(get);
        };
        OMEROService.prototype.login = function (config, csrf, user) {
            sails.log.debug('login');
            var jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', csrf);
            var post = requestPromise({
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
            var jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', csrf);
            jar = this.cookieJar(jar, config, 'sessionid', sessionid);
            var get = requestPromise({
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
            var jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            var post = requestPromise({
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
            var jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            var formData = {
                project: id,
                mapAnnotation: JSON.stringify(mapAnnotation)
            };
            if (annId) {
                formData['annId'] = annId;
            }
            var post = requestPromise({
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
            var jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            var get = requestPromise({
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
