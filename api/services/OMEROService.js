"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const requestPromise = require("request-promise");
const _ = require("lodash");
const services = require("../core/CoreService.js");
var Services;
(function (Services) {
    class OMEROService extends services.Services.Core.Service {
        constructor() {
            super();
            this._exportedMethods = [
                'csrf',
                'login',
                'projects',
                'createContainer',
                'annotateMap',
                'annotations',
                'getCookies',
                'getCookieValue',
                'images'
            ];
        }
        cookieJar(jar, config, key, value) {
            const keyvalue = key + '=' + value;
            const cookie = requestPromise.cookie('' + keyvalue);
            jar.setCookie(cookie, config.host, function (error, cookie) {
            });
            return jar;
        }
        getCookies(cookies) {
            const cookieJar = [];
            cookies.forEach((rawcookies) => {
                var cookie = requestPromise.cookie(rawcookies);
                cookieJar.push({ key: cookie.key, value: cookie.value, expires: cookie.expires });
            });
            return cookieJar;
        }
        getCookieValue(cookieJar, key) {
            const cookie = _.find(cookieJar, { key: key });
            if (cookie) {
                return cookie['value'];
            }
            else
                return '';
        }
        csrf(config) {
            const get = requestPromise({
                uri: `${config.host}/api/v0/token/`
            });
            return rxjs_1.Observable.fromPromise(get);
        }
        login(config, csrf, user) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', csrf);
            const post = requestPromise({
                uri: `${config.host}/api/v0/login/`,
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
            return rxjs_1.Observable.fromPromise(post);
        }
        projects(config, csrf, sessionid, sessionUuid, limit, offset, owner) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', csrf);
            jar = this.cookieJar(jar, config, 'sessionid', sessionid);
            const get = requestPromise({
                uri: `${config.host}/api/v0/m/projects/?limit=${limit}&offset=${offset}&owner=${owner}`,
                jar: jar,
                headers: {
                    'X-CSRFToken': csrf,
                    'sessionUuid': sessionUuid
                }
            });
            return rxjs_1.Observable.fromPromise(get);
        }
        createContainer(config, app, project, containerType, groupId) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            const post = requestPromise({
                uri: `${config.host}/api/v0/m/save/?group=${groupId}`,
                method: 'POST',
                jar: jar,
                body: {
                    'Name': project.name,
                    'Description': project.description,
                    '@type': `http://www.openmicroscopy.org/Schemas/OME/2016-06#${containerType}`
                },
                json: true,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return rxjs_1.Observable.fromPromise(post);
        }
        annotateMap({ config, app, id, annId, mapAnnotation }) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            const formData = {
                project: id,
                mapAnnotation: JSON.stringify(mapAnnotation)
            };
            if (annId) {
                formData['annId'] = annId;
            }
            const post = requestPromise({
                uri: `${config.host}/webclient/annotate_map/`,
                method: 'POST',
                jar: jar,
                formData: formData,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                },
                resolveWithFullResponse: true
            });
            return rxjs_1.Observable.fromPromise(post);
        }
        annotations({ config, app, id }) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            const get = requestPromise({
                uri: `${config.host}/webclient/api/annotations/?type=map&project=${id}`,
                jar: jar,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return rxjs_1.Observable.fromPromise(get);
        }
        images({ config, app, offset, limit, owner, group, normalize }) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            const post = requestPromise({
                uri: `${config.host}/api/v0/m/images/?offset=${offset}&limit=${limit}&owner=${owner}&group=${group}&normalize=${normalize}`,
                method: 'GET',
                jar: jar,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return rxjs_1.Observable.fromPromise(post);
        }
        image({ config, app, imageId }) {
            let jar = requestPromise.jar();
            jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
            jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
            const post = requestPromise({
                uri: `${config.host}/api/v0/m/images/${imageId}/`,
                method: 'GET',
                jar: jar,
                headers: {
                    'X-CSRFToken': app.csrf,
                    'sessionUuid': app.sessionUuid
                }
            });
            return rxjs_1.Observable.fromPromise(post);
        }
    }
    Services.OMEROService = OMEROService;
})(Services = exports.Services || (exports.Services = {}));
module.exports = new Services.OMEROService().exports();
