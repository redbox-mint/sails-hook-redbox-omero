"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const controller = require("../core/CoreController.js");
var Controllers;
(function (Controllers) {
    class OMEROController extends controller.Controllers.Core.Controller {
        constructor() {
            super();
            this._exportedMethods = [
                'login',
                'projects',
                'create',
                'link',
                'checkLink',
                'images'
            ];
            this.config = new Config();
        }
        login(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                const user = {
                    username: req.param('username') || '',
                    password: req.param('password') || ''
                };
                let csrf = {};
                let info = {};
                const userId = req.user.id;
                OMEROService.csrf(this.config)
                    .flatMap(response => {
                    csrf = JSON.parse(response);
                    return OMEROService.login(this.config, csrf.data, user);
                })
                    .flatMap(response => {
                    const cookies = response.headers['set-cookie'];
                    const body = JSON.parse(response.body);
                    const login = body.eventContext;
                    const sessionUuid = login.sessionUuid;
                    const cookieJar = OMEROService.getCookies(cookies);
                    info = {
                        csrf: csrf.data,
                        sessionid: OMEROService.getCookieValue(cookieJar, 'sessionid'),
                        sessionUuid: sessionUuid,
                        memberOfGroups: login.memberOfGroups,
                        groupId: login.groupId,
                        userId: login.userId
                    };
                    return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName);
                })
                    .flatMap(response => {
                    if (response && response.id) {
                        return WorkspaceService.updateWorkspaceInfo(response.id, info);
                    }
                    else {
                        return WorkspaceService.createWorkspaceInfo(userId, this.config.appName, info);
                    }
                })
                    .subscribe(response => {
                    const data = { status: true, login: true };
                    this.ajaxOk(req, res, null, data);
                }, error => {
                    const errorMessage = `Failed to login for user ${user.username}`;
                    sails.log.error(errorMessage);
                    sails.log.error(this.config.host + ' => ' + this.config.domain);
                    this.ajaxFail(req, res, errorMessage, { status: false, message: errorMessage });
                });
            }
        }
        projects(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                const userId = req.user.id;
                const limit = req.param('limit') || 10;
                const offset = req.param('offset') || 0;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(response => {
                    sails.log.debug('userInfo');
                    if (response.info) {
                        const app = response.info;
                        return OMEROService.projects(this.config, app.csrf, app.sessionid, app.sessionUuid, limit, offset, app.userId);
                    }
                    else {
                        throw new Error('Missing application credentials');
                    }
                })
                    .subscribe(response => {
                    sails.log.debug('projects');
                    const data = { status: true, projects: JSON.parse(response) };
                    this.ajaxOk(req, res, null, data);
                }, error => {
                    const errorMessage = `Failed to get projects for user ${req.user.username}`;
                    sails.log.error(errorMessage);
                    this.ajaxFail(req, res, errorMessage, error);
                });
            }
        }
        create(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                const userId = req.user.id;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(response => {
                    sails.log.debug('userInfo');
                    const appId = this.config.appId;
                    const app = response.info;
                    const project = req.param('creation');
                    project.type = 'project';
                    return OMEROService.createContainer(this.config, app, project, 'Project', app.groupId || this.config.defaultGroupId);
                })
                    .subscribe(response => {
                    sails.log.debug('createProject');
                    let status = true;
                    let data = {};
                    if (!response.data) {
                        data = { status: false, create: {} };
                    }
                    else {
                        data = { status: status, create: response.data };
                    }
                    this.ajaxOk(req, res, null, data);
                }, error => {
                    const errorMessage = `Failed to create project for user ${req.user.username}`;
                    sails.log.error(errorMessage);
                    this.ajaxFail(req, res, errorMessage, error);
                });
            }
        }
        link(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
                const userId = req.user.id;
                const username = req.user.username;
                const project = req.param('project');
                const rdmp = req.param('rdmp');
                const recordMap = req.param('recordMap');
                let annId = null;
                let mapAnnotation = [];
                let record = WorkspaceService.mapToRecord(project, recordMap);
                record = _.merge(record, { type: this.config.recordType });
                record.rdmpOid = rdmp;
                let app = {};
                let annotations = [];
                let rowAnnotation;
                let idAnnotation;
                let workspaceId;
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(response => {
                    sails.log.debug('userInfo');
                    app = response.info;
                    return OMEROService.annotations({ config: this.config, app: app, id: record.omeroId });
                }).flatMap(response => {
                    sails.log.debug('annotations');
                    response = (JSON.parse(response));
                    mapAnnotation = response['annotations'];
                    const ann = _.first(this.findAnnotation('stash', mapAnnotation));
                    if (!ann) {
                        rowAnnotation = undefined;
                        idAnnotation = undefined;
                        return this.createAnnotation({
                            app: app, record: record, rowAnnotation: rowAnnotation,
                            idAnnotation: idAnnotation, annotations: annotations, username: username,
                            rdmp: rdmp, brandingAndPortalUrl: this.config.brandingAndPortalUrl
                        });
                    }
                    else
                        return rxjs_1.Observable.of({ body: ann });
                }).subscribe(response => {
                    sails.log.debug('linkWorkspace');
                    const data = { status: true, response };
                    this.ajaxOk(req, res, null, data);
                }, error => {
                    const errorMessage = `Failed to link project for user ${req.user.username}`;
                    sails.log.error(errorMessage);
                    this.ajaxFail(req, res, errorMessage, error);
                });
            }
        }
        checkLink(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
                const userId = req.user.id;
                const rdmpId = req.param('rdmpId');
                const omeroId = req.param('omeroId');
                let app = {};
                let info = {};
                let check = {
                    ws: false,
                    omero: false
                };
                let annotations = [];
                let mapAnnotation = [];
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(response => {
                    const app = response.info;
                    return OMEROService.annotations({
                        config: this.config, app: app, id: omeroId
                    });
                }).flatMap(response => {
                    try {
                        response = JSON.parse(response) || {};
                        mapAnnotation = response.annotations || null;
                    }
                    catch (e) {
                        mapAnnotation = [];
                    }
                    const ann = _.first(this.findAnnotation('stash', mapAnnotation));
                    if (ann) {
                        info = this.workspaceInfoFromRepo(mapAnnotation[ann.index]['values'][ann.row][1]);
                    }
                    return WorkspaceService.getRecordMeta(this.config, rdmpId);
                }).subscribe(recordMetadata => {
                    if (recordMetadata && recordMetadata['workspaces']) {
                        if (info['rdmpId']) {
                            check.ws = true;
                        }
                        if (rdmpId === info['rdmpId']) {
                            check.omero = true;
                        }
                    }
                    this.ajaxOk(req, res, null, { status: true, check: check });
                }, error => {
                    const errorMessage = `Failed compare link workspace project: ${omeroId}`;
                    sails.log.error(error);
                    sails.log.error(errorMessage);
                    this.ajaxFail(req, res, errorMessage, error);
                });
            }
        }
        createAnnotation({ app, record, rowAnnotation, idAnnotation, annotations, username, rdmp, brandingAndPortalUrl }) {
            sails.log.debug('createWorkspaceRecord');
            this.config.set();
            let workspaceId = '';
            let recordMetadata = null;
            this.config.brandingAndPortalUrl = brandingAndPortalUrl;
            return WorkspaceService.getRecordMeta(this.config, rdmp)
                .flatMap(response => {
                sails.log.debug('recordMetadata');
                recordMetadata = response;
                record.rdmpTitle = recordMetadata.title;
                sails.log.debug(record);
                return WorkspaceService.createWorkspaceRecord(this.config, username, record, this.config.recordType, this.config.workflowStage);
            }).flatMap(response => {
                workspaceId = response.oid;
                const create = this.mapAnnotation(rowAnnotation, this.getAnnotation(idAnnotation, annotations), 'stash', `${rdmp}.${workspaceId}`, 'stash RDMP', `${brandingAndPortalUrl}/record/view/${rdmp}`);
                const annId = idAnnotation || null;
                const mapAnnotation = create.values;
                return OMEROService.annotateMap({
                    config: this.config, app: app, id: record.omeroId,
                    annId: annId, mapAnnotation: mapAnnotation
                });
            }).flatMap(() => {
                if (recordMetadata.workspaces) {
                    const wss = recordMetadata.workspaces.find(id => workspaceId === id);
                    if (!wss) {
                        recordMetadata.workspaces.push({ id: workspaceId });
                    }
                }
                return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
            });
        }
        getAnnotation(id, annotations) {
            return annotations.find(an => an.id === id);
        }
        mapAnnotation(row, annotation, key, newValue, humanKey, humanAnnotation) {
            if (annotation) {
                annotation.values[row.toString()][1] = newValue;
                return annotation;
            }
            else {
                const annotation = {
                    values: [[key, newValue.toString()], [humanKey, humanAnnotation]]
                };
                return annotation;
            }
        }
        findAnnotation(annotation, annotations) {
            return annotations.map((anns, index) => {
                const row = _.findIndex(anns['values'], an => an[0] === annotation);
                return { index: index, id: anns['id'], row: row != -1 ? row : null };
            }).filter((cur) => {
                return cur.row != null;
            });
        }
        workspaceInfoFromRepo(workspaceLink) {
            if (workspaceLink) {
                const workspaceInfo = workspaceLink.split('.');
                return { rdmpId: _.first(workspaceInfo), workspaceId: _.last(workspaceInfo) };
            }
            else {
                return { rdmpId: null, workspaceId: null };
            }
        }
        images(req, res) {
            this.config.set();
            if (!req.isAuthenticated()) {
                this.ajaxFail(req, res, `User not authenticated`);
            }
            else {
                const userId = req.user.id;
                const offset = 10;
                const limit = 10;
                const normalize = 'false';
                let app = {};
                return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
                    .flatMap(response => {
                    app = response.info;
                    if (response.info) {
                        const app = response.info;
                        return OMEROService.images({
                            config: this.config, app: app, offset: offset, limit: limit,
                            owner: app.userId, group: app.ownerId, normalize: normalize
                        });
                    }
                    else {
                        throw new Error('Missing application credentials');
                    }
                }).subscribe(response => {
                    this.ajaxOk(req, res, null, { status: true, response: response });
                }, error => {
                    const errorMessage = `Failed to get images of user: ${userId}`;
                    sails.log.error(errorMessage);
                    this.ajaxFail(req, res, errorMessage, error);
                });
            }
        }
    }
    Controllers.OMEROController = OMEROController;
    class Config {
        set() {
            const workspaceConfig = sails.config.workspaces;
            const OMEROConfig = workspaceConfig.omero;
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
        }
    }
})(Controllers = exports.Controllers || (exports.Controllers = {}));
module.exports = new Controllers.OMEROController().exports();
