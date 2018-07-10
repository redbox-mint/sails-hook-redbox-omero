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
require("rxjs/add/operator/map");
var controller = require("../core/CoreController.js");
var Controllers;
(function (Controllers) {
    var OMEROController = (function (_super) {
        __extends(OMEROController, _super);
        function OMEROController() {
            var _this = _super.call(this) || this;
            _this._exportedMethods = [
                'login',
                'projects',
                'create',
                'link',
                'checkLink'
            ];
            _this.config = new Config();
            return _this;
        }
        OMEROController.prototype.login = function (req, res) {
            var _this = this;
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, "User not authenticated");
            }
            else {
                var user_1 = {
                    username: req.param('username') || '',
                    password: req.param('password') || ''
                };
                var csrf_1 = {};
                var info_1 = {};
                var userId_1 = req.user.id;
                OMEROService.csrf(this.config)
                    .flatMap(function (response) {
                    csrf_1 = JSON.parse(response);
                    return OMEROService.login(_this.config, csrf_1.data, user_1);
                })
                    .flatMap(function (response) {
                    var cookies = response.headers['set-cookie'];
                    var body = JSON.parse(response.body);
                    var login = body.eventContext;
                    var sessionUuid = login.sessionUuid;
                    var cookieJar = OMEROService.getCookies(cookies);
                    info_1 = {
                        csrf: csrf_1.data,
                        sessionid: OMEROService.getCookieValue(cookieJar, 'sessionid'),
                        sessionUuid: sessionUuid,
                        memberOfGroups: login.memberOfGroups,
                        groupId: login.groupId,
                        userId: login.userId
                    };
                    sails.log.debug(info_1);
                    return WorkspaceService.updateWorkspaceInfo(response.id, info_1);
                })
                    .flatMap(function (response) {
                    if (response.id && response.info !== info_1) {
                        return WorkspaceService.updateWorkspaceInfo(response.id, info_1);
                    }
                    else {
                        return WorkspaceService.createWorkspaceInfo(userId_1, _this.config.appName, info_1);
                    }
                })
                    .subscribe(function (response) {
                    var data = { status: true, login: true };
                    _this.ajaxOk(req, res, null, data);
                }, function (error) {
                    var errorMessage = "Failed to login for user " + user_1.username;
                    sails.log.error(errorMessage);
                    sails.log.error(_this.config.host + ' => ' + _this.config.domain);
                    _this.ajaxFail(req, res, errorMessage, { status: false, message: errorMessage });
                });
            }
        };
        OMEROController.prototype.projects = function (req, res) {
            var _this = this;
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, "User not authenticated");
            }
            else {
                var userId = req.user.id;
                var limit_1 = req.param('limit') || 10;
                var offset_1 = req.param('offset') || 0;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(function (response) {
                    sails.log.debug('userInfo');
                    if (response.info) {
                        var app = response.info;
                        return OMEROService.projects(_this.config, app.csrf, app.sessionid, app.sessionUuid, limit_1, offset_1, app.userId);
                    }
                    else {
                        throw new Error('Missing application credentials');
                    }
                })
                    .subscribe(function (response) {
                    sails.log.debug('projects');
                    var data = { status: true, projects: JSON.parse(response) };
                    _this.ajaxOk(req, res, null, data);
                }, function (error) {
                    var errorMessage = "Failed to get projects for user " + req.user.username;
                    sails.log.error(errorMessage);
                    _this.ajaxFail(req, res, errorMessage, error);
                });
            }
        };
        OMEROController.prototype.create = function (req, res) {
            var _this = this;
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, "User not authenticated");
            }
            else {
                var userId = req.user.id;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(function (response) {
                    sails.log.debug('userInfo');
                    var appId = _this.config.appId;
                    var app = response.info;
                    var project = req.param('creation');
                    project.type = 'project';
                    return OMEROService.createContainer(_this.config, app, project, 'Project', _this.config.defaultGroupId);
                })
                    .subscribe(function (response) {
                    sails.log.debug('createProject');
                    var status = true;
                    var data = {};
                    if (!response.data) {
                        data = { status: false, create: {} };
                    }
                    else {
                        data = { status: status, create: response.data };
                    }
                    _this.ajaxOk(req, res, null, data);
                }, function (error) {
                    var errorMessage = "Failed to create project for user " + req.user.username;
                    sails.log.error(errorMessage);
                    _this.ajaxFail(req, res, errorMessage, error);
                });
            }
        };
        OMEROController.prototype.link = function (req, res) {
            var _this = this;
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, "User not authenticated");
            }
            else {
                this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
                var userId = req.user.id;
                var username_1 = req.user.username;
                var project = req.param('project');
                var rdmp_1 = req.param('rdmp');
                var recordMap = req.param('recordMap');
                var annId = null;
                var mapAnnotation_1 = [];
                var record_1 = WorkspaceService.mapToRecord(project, recordMap);
                record_1 = _.merge(record_1, { type: this.config.recordType });
                var app_1 = {};
                var annotations_1 = [];
                var rowAnnotation_1;
                var idAnnotation_1;
                var workspaceId = void 0;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(function (response) {
                    sails.log.debug('userInfo');
                    app_1 = response.info;
                    return OMEROService.annotations({ config: _this.config, app: app_1, id: record_1.omeroId });
                }).flatMap(function (response) {
                    sails.log.debug('annotations');
                    response = (JSON.parse(response));
                    mapAnnotation_1 = response['annotations'];
                    var ann = _.first(_this.findAnnotation('stash', mapAnnotation_1));
                    if (!ann) {
                        rowAnnotation_1 = undefined;
                        idAnnotation_1 = undefined;
                        return _this.createAnnotation({
                            app: app_1, record: record_1, rowAnnotation: rowAnnotation_1, idAnnotation: idAnnotation_1, annotations: annotations_1, username: username_1, rdmp: rdmp_1
                        });
                    }
                    else
                        return Rx_1.Observable.of({ body: ann });
                }).subscribe(function (response) {
                    sails.log.debug('linkWorkspace');
                    var data = { status: true, response: response };
                    _this.ajaxOk(req, res, null, data);
                }, function (error) {
                    var errorMessage = "Failed to link project for user " + req.user.username;
                    sails.log.error(errorMessage);
                    _this.ajaxFail(req, res, errorMessage, error);
                });
            }
        };
        OMEROController.prototype.checkLink = function (req, res) {
            var _this = this;
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, "User not authenticated");
            }
            else {
                this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
                var userId = req.user.id;
                var rdmpId_1 = req.param('rdmpId');
                var omeroId_1 = req.param('omeroId');
                var app = {};
                var info_2 = {};
                var check_1 = {
                    ws: false,
                    omero: false
                };
                var annotations = [];
                var mapAnnotation_2 = [];
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(function (response) {
                    var app = response.info;
                    return OMEROService.annotations({
                        config: _this.config, app: app, id: omeroId_1
                    });
                }).flatMap(function (response) {
                    try {
                        response = JSON.parse(response) || {};
                        mapAnnotation_2 = response.annotations || null;
                    }
                    catch (e) {
                        mapAnnotation_2 = [];
                    }
                    var ann = _.first(_this.findAnnotation('stash', mapAnnotation_2));
                    if (ann) {
                        info_2 = _this.workspaceInfoFromRepo(mapAnnotation_2[ann.index]['values'][ann.row][1]);
                    }
                    return WorkspaceService.getRecordMeta(_this.config, rdmpId_1);
                }).subscribe(function (recordMetadata) {
                    if (recordMetadata && recordMetadata['workspaces']) {
                        if (info_2['rdmpId']) {
                            check_1.ws = true;
                        }
                        if (rdmpId_1 === info_2['rdmpId']) {
                            check_1.omero = true;
                        }
                    }
                    _this.ajaxOk(req, res, null, { status: true, check: check_1 });
                }, function (error) {
                    var errorMessage = "Failed compare link workspace project: " + omeroId_1;
                    sails.log.error(errorMessage);
                    _this.ajaxFail(req, res, errorMessage, error);
                });
            }
        };
        OMEROController.prototype.createAnnotation = function (_a) {
            var _this = this;
            var app = _a.app, record = _a.record, rowAnnotation = _a.rowAnnotation, idAnnotation = _a.idAnnotation, annotations = _a.annotations, username = _a.username, rdmp = _a.rdmp;
            sails.log.debug('createWorkspaceRecord');
            var workspaceId = '';
            return WorkspaceService.provisionerUser(this.config.provisionerUser)
                .flatMap(function (response) {
                sails.log.debug('provisionerUser:createWorkspaceRecord');
                _this.config.redboxHeaders['Authorization'] = 'Bearer ' + response.token;
                return WorkspaceService.createWorkspaceRecord(_this.config, username, record, _this.config.recordType, _this.config.workflowStage);
            }).flatMap(function (response) {
                workspaceId = response.oid;
                var create = _this.mapAnnotation(rowAnnotation, _this.getAnnotation(idAnnotation, annotations), 'stash', rdmp + "." + workspaceId);
                var annId = idAnnotation || null;
                var mapAnnotation = create.values;
                return OMEROService.annotateMap({
                    config: _this.config, app: app, id: record.omeroId,
                    annId: annId, mapAnnotation: mapAnnotation
                });
            }).flatMap(function (response) {
                return WorkspaceService.getRecordMeta(_this.config, rdmp);
            })
                .flatMap(function (recordMetadata) {
                sails.log.debug('recordMetadata');
                if (recordMetadata && recordMetadata.workspaces) {
                    var wss = recordMetadata.workspaces.find(function (id) { return workspaceId === id; });
                    if (!wss) {
                        recordMetadata.workspaces.push({ id: workspaceId });
                    }
                }
                return WorkspaceService.updateRecordMeta(_this.config, recordMetadata, rdmp);
            });
        };
        OMEROController.prototype.getAnnotation = function (id, annotations) {
            return annotations.find(function (an) { return an.id === id; });
        };
        OMEROController.prototype.mapAnnotation = function (row, annotation, key, newValue) {
            if (annotation) {
                annotation.values[row.toString()][1] = newValue;
                return annotation;
            }
            else {
                var annotation_1 = {
                    values: [[key, newValue.toString()]]
                };
                return annotation_1;
            }
        };
        OMEROController.prototype.findAnnotation = function (annotation, annotations) {
            return annotations.map(function (anns, index) {
                var row = anns['values'].findIndex(function (an) { return an[0] === annotation; });
                return { index: index, id: anns['id'], row: row != -1 ? row : null };
            }).filter(function (cur) {
                return cur.row != null;
            });
        };
        OMEROController.prototype.workspaceInfoFromRepo = function (workspaceLink) {
            if (workspaceLink) {
                var workspaceInfo = workspaceLink.split('.');
                return { rdmpId: _.first(workspaceInfo), workspaceId: _.last(workspaceInfo) };
            }
            else {
                return { rdmpId: null, workspaceId: null };
            }
        };
        return OMEROController;
    }(controller.Controllers.Core.Controller));
    Controllers.OMEROController = OMEROController;
    var Config = (function () {
        function Config() {
        }
        Config.prototype.set = function () {
            var workspaceConfig = sails.config.workspaces;
            var OMEROConfig = workspaceConfig.omero;
            this.host = OMEROConfig.host;
            this.recordType = OMEROConfig.recordType;
            this.workflowStage = OMEROConfig.workflowStage;
            this.formName = OMEROConfig.formName;
            this.appName = OMEROConfig.appName;
            this.domain = OMEROConfig.domain;
            this.parentRecord = workspaceConfig.parentRecord;
            this.provisionerUser = workspaceConfig.provisionerUser;
            this.serverId = OMEROConfig.serverId;
            this.appId = OMEROConfig.appId;
            this.brandingAndPortalUrl = '';
            this.redboxHeaders = {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Authorization': workspaceConfig.portal.authorization,
            };
            this.defaultGroupId = OMEROConfig.defaultGroupId;
        };
        return Config;
    }());
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.OMEROController().exports();
