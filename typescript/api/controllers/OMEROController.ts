declare var module;
declare var sails, Model;
declare var _;

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

declare var BrandingService, WorkspaceService, OMEROService;
/**
 * Package that contains all Controllers.
 */
import controller = require('../core/CoreController.js');

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class OMEROController extends controller.Controllers.Core.Controller {

    protected _exportedMethods: any = [
      'login',
      'projects',
      'create',
      'link',
      'checkLink'
    ];
    _config: any;

    protected config: any;

    constructor() {
      super();
      this.config = new Config();
    }

    login(req, res) {
      this.config.set();
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const user = {
          username: req.param('username') || '',
          password: req.param('password') || ''
        };
        let csrf: any = {};
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
            sails.log.debug(info);
            return WorkspaceService.updateWorkspaceInfo(response.id, info);
          })
          .flatMap(response => {
            if (response.id && response.info !== info) {
              return WorkspaceService.updateWorkspaceInfo(response.id, info);
            } else {
              return WorkspaceService.createWorkspaceInfo(userId, this.config.appName, info);
            }
          })
          .subscribe(response => {
            const data = {status: true, login: true};
            this.ajaxOk(req, res, null, data);
          }, error => {
            const errorMessage = `Failed to login for user ${user.username}`;
            sails.log.error(errorMessage);
            sails.log.error(this.config.host + ' => ' + this.config.domain);
            this.ajaxFail(req, res, errorMessage, {status: false, message: errorMessage});
          });
      }
    }

    projects(req, res) {
      this.config.set();
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        const limit = req.param('limit') || 10;
        const offset = req.param('offset') || 0;
        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .flatMap(response => {
            sails.log.debug('userInfo');
            if (response.info) {
              const app = response.info;
              return OMEROService.projects(this.config, app.csrf, app.sessionid, app.sessionUuid, limit, offset, app.userId);
            } else {
              throw new Error('Missing application credentials');
            }
          })
          .subscribe(response => {
            sails.log.debug('projects');
            const data = {status: true, projects: JSON.parse(response)};
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
      } else {
        const userId = req.user.id;
        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .flatMap(response => {
            sails.log.debug('userInfo');
            const appId = this.config.appId;
            const app = response.info;
            const project = req.param('creation');
            //TODO: add type checking object map here
            project.type = 'project';
            return OMEROService.createContainer(this.config, app, project, 'Project', this.config.defaultGroupId);
          })
          .subscribe(response => {
            sails.log.debug('createProject');
            let status = true;
            let data = {}
            if (!response.data) {
              data = {status: false, create: {}};

            } else {
              data = {status: status, create: response.data};
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
      } else {
        this.config.brandingAndPortalUrl = BrandingService.getFullPath(req);
        const userId = req.user.id;
        const username = req.user.username;
        const project = req.param('project');
        const rdmp = req.param('rdmp');
        const recordMap = req.param('recordMap');

        let annId = null;
        let mapAnnotation = [];
        let record = WorkspaceService.mapToRecord(project, recordMap);
        record = _.merge(record, {type: this.config.recordType});

        let app = {};
        let annotations = [];
        let rowAnnotation;
        let idAnnotation;
        let workspaceId;

        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .flatMap(response => {
            sails.log.debug('userInfo');
            app = response.info;
            return OMEROService.annotations({config: this.config, app: app, id: record.omeroId});
          }).flatMap(response => {
            sails.log.debug('annotations');
            response = (JSON.parse(response));
            mapAnnotation = response['annotations'];
            //Check whether there is a workspace created
            const ann = _.first(this.findAnnotation('stash', mapAnnotation));
            if (!ann) {
              rowAnnotation = undefined;
              idAnnotation = undefined;
              return this.createAnnotation({
                app, record, rowAnnotation, idAnnotation, annotations, username, rdmp
              });
            } else return Observable.of({body: ann});
          }).subscribe(response => {
            sails.log.debug('linkWorkspace');
            const data = {status: true, response};
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
      } else {
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
            })
          }).flatMap(response => {
            try {
              response = JSON.parse(response) || {};
              mapAnnotation = response.annotations || null;
            } catch (e) {
              mapAnnotation = [];
            }
            //Check whether there is a workspace created
            const ann = _.first(this.findAnnotation('stash', mapAnnotation));// Trying to find an annotation like this: e0582136e22f13059f5d36769282403d.75a2c64ca8c7ad77e9a68adc11e2015b
            if (ann) {
              info = this.workspaceInfoFromRepo(mapAnnotation[ann.index]['values'][ann.row][1]);
            }
            return WorkspaceService.getRecordMeta(this.config, rdmpId);
          }).subscribe(recordMetadata => {

            if (recordMetadata && recordMetadata['workspaces']) {
              //const wss = recordMetadata.workspaces.find(id => info['workspaceId'] === id);
              if (info['rdmpId']) {
                check.ws = true;
              }
              if (rdmpId === info['rdmpId']) {
                check.omero = true;
              }
            }
            this.ajaxOk(req, res, null, {status: true, check: check});
          }, error => {
            const errorMessage = `Failed compare link workspace project: ${omeroId}`;
            sails.log.error(errorMessage);
            this.ajaxFail(req, res, errorMessage, error);
          });
      }
    }

    createAnnotation({app, record, rowAnnotation, idAnnotation, annotations, username, rdmp}) {
      sails.log.debug('createWorkspaceRecord');
      let workspaceId = '';
      return WorkspaceService.provisionerUser(this.config.provisionerUser)
        .flatMap(response => {
          sails.log.debug('provisionerUser:createWorkspaceRecord');
          this.config.redboxHeaders['Authorization'] = 'Bearer ' + response.token;
          return WorkspaceService.createWorkspaceRecord(this.config, username, record, this.config.recordType, this.config.workflowStage);
        }).flatMap(response => {
          workspaceId = response.oid;
          const create = this.mapAnnotation(
            rowAnnotation,
            this.getAnnotation(idAnnotation, annotations),
            'stash',
            `${rdmp}.${workspaceId}`
          );
          const annId = idAnnotation || null;
          const mapAnnotation = create.values;
          return OMEROService.annotateMap({
            config: this.config, app: app, id: record.omeroId,
            annId: annId, mapAnnotation: mapAnnotation
          });

        }).flatMap(response => {
          return WorkspaceService.getRecordMeta(this.config, rdmp);
        })
        .flatMap(recordMetadata => {
          sails.log.debug('recordMetadata');
          if (recordMetadata && recordMetadata.workspaces) {
            const wss = recordMetadata.workspaces.find(id => workspaceId === id);
            if (!wss) {
              recordMetadata.workspaces.push({id: workspaceId});
            }
          }
          return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
        });
    }

    getAnnotation(id: number, annotations: any) {
      return annotations.find(an => an.id === id);
    }

    mapAnnotation(row: number, annotation: any, key, newValue: string) {
      //OMERO stores annotations as array of arrays. Each element being array[0] property and array[1] value
      if (annotation) {
        annotation.values[row.toString()][1] = newValue;
        return annotation;
      } else {
        const annotation = {
          values: [[key, newValue.toString()]]
        };
        return annotation;
      }
    }

    findAnnotation(annotation: string, annotations: string[][]) {
      //Return annotation id where string == annotation[][]
      return annotations.map((anns, index) => {
        const row = anns['values'].findIndex(an => an[0] === annotation);
        return {index: index, id: anns['id'], row: row != -1 ? row : null}
      }).filter((cur) => {
        return cur.row != null;
      });
    }

    workspaceInfoFromRepo(workspaceLink) {
      if (workspaceLink) {
        const workspaceInfo = workspaceLink.split('.');
        return {rdmpId: _.first(workspaceInfo), workspaceId: _.last(workspaceInfo)};
      } else {
        return {rdmpId: null, workspaceId: null};
      }
    }

  }

  class Config {
    host: string;
    recordType: string;
    formName: string;
    workflowStage: string;
    appId: string;
    serverId: string;
    appName: string;
    parentRecord: string;
    provisionerUser: string;
    brandingAndPortalUrl: string;
    redboxHeaders: any;
    domain: string;
    defaultGroupId: number;

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
      this.defaultGroupId = OMEROConfig.defaultGroupId

    }
  }

}

module.exports = new Controllers.OMEROController().exports();
