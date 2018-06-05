declare var module;
declare var sails, Model;
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
      'link'
    ];
    protected config: any;

    constructor() {
      super();
      this.config = new Config();
      const OMEROConfig = sails.config.local.workspaces.omero;
      const workspaceConfig = sails.config.local.workspaces;
      this.config = {
        host: OMEROConfig.host,
        recordType: OMEROConfig.recordType,
        workflowStage: OMEROConfig.workflowStage,
        formName: OMEROConfig.formName,
        appName: OMEROConfig.appName,
        domain: OMEROConfig.domain,
        parentRecord: workspaceConfig.parentRecord,
        provisionerUser: workspaceConfig.provisionerUser,
        serverId: OMEROConfig.serverId,
        appId: OMEROConfig.appId,
        brandingAndPortalUrl: '',
        redboxHeaders:  {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Authorization': '',
        }
      }
    }

    login(req, res) {
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
            const cookieJar = WorkspaceService.getCookies(cookies);
            info = {
              csrf: csrf.data,
              sessionid: WorkspaceService.getCookieValue(cookieJar, 'sessionid'),
              sessionUuid: sessionUuid,
              memberOfGroups: login.memberOfGroups,
              groupId: login.groupId
            };
            return WorkspaceService.createWorkspaceInfo(userId, this.config.appName, info);
          })
          .flatMap(response => {
            if(response.id && response.info !== info) {
              return WorkspaceService.updateWorkspaceInfo(response.id, info);
            }else {
              return Observable.of('');
            }
          })
          .subscribe(response => {
            sails.log.debug('login');
            const data = {status: true, login: true};
            this.ajaxOk(req, res, null, data);
          }, error => {
            const errorMessage = `Failed to login for user ${user.username}`;
            sails.log.error(errorMessage);
            this.ajaxFail(req, res, errorMessage, error);
          });
      }
    }

    projects(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        const userId = req.user.id;
        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .flatMap(response => {
            sails.log.debug('userInfo');
            const app = response.info;
            return OMEROService.projects(this.config, app.csrf, app.sessionid, app.sessionUuid);
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
            project.type = 'project';
            return OMEROService.createContainer(this.config, app, project);
          })
          .subscribe(response => {
            sails.log.debug('createProject');
            sails.log.debug(response);
            let status = true;
            if(response.bad === 'true'){
              status = false;
            }
            const data = {status: status, create: JSON.parse(response)};
            this.ajaxOk(req, res, null, data);
          }, error => {
            const errorMessage = `Failed to create project for user ${req.user.username}`;
            sails.log.error(errorMessage);
            this.ajaxFail(req, res, errorMessage, error);
          });
      }
    }

    link(req, res) {
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
        this.config.brandingAndPortalUrl = sails.getBaseUrl() + BrandingService.getBrandAndPortalPath(req);
        const userId = req.user.id;
        const username = req.user.username;
        const project = req.param('project');
        const rdmp = req.param('rdmp');
        const recordMap = req.param('recordMap');

        let annId = null;//
        let mapAnnotation = [];//

        let record = WorkspaceService.mapToRecord(project, recordMap);
        record = _.merge(record, {type: this.config.recordType});
        sails.log.debug('OMERO::LINK::');
        sails.log.debug(record.id);
        let app = {};
        let annotations = [];
        let rowAnnotation;
        let idAnnotation;

        return WorkspaceService.workspaceAppFromUserId(userId, this.config.appName)
          .flatMap(response => {
            sails.log.debug('userInfo');
            const appId = this.config.appId;
            app = response.info;
            return OMEROService.annotations({config: this.config, app: app, id: record.id});
          }).flatMap(response => {
            sails.log.debug('annotations');
            annotations = (JSON.parse(response)).annotations;
            mapAnnotation = annotations;
            //Check whether there is a workspace created
            const ann = _.first(this.findAnnotation('stash', mapAnnotation));
            if(!ann) {
              rowAnnotation = undefined;
              idAnnotation = undefined;
              return this.createAnnotation({
                app, record, rowAnnotation, idAnnotation, annotations, username, rdmp
              });
            } else return Observable.of('');
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

    createAnnotation({app, record, rowAnnotation, idAnnotation, annotations, username, rdmp}){
      sails.log.debug('createWorkspaceRecord');
      return WorkspaceService.provisionerUser(this.config.provisionerUser)
        .flatMap(response => {
          sails.log.debug('provisionerUser:createWorkspaceRecord');
          this.config.redboxHeaders['Authorization'] = 'Bearer ' + response.token;
          return WorkspaceService.createWorkspaceRecord(this.config, username, record, this.config.recordType, this.config.workflowStage);
        }).flatMap(response => {
          const create = this.mapAnnotation(
            rowAnnotation,
            this.getAnnotation(idAnnotation, annotations),
            'stash',
            `${rdmp}.${response.oid}`
          );
          const annId = idAnnotation || null;
          const mapAnnotation = create.values;
          return OMEROService.annotateMap({
            config: this.config, app: app, id: record.id,
            annId: annId, mapAnnotation: mapAnnotation
          });
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
        const row = anns.values.findIndex(an => an[0] === annotation);
        return {index: index, id: anns.id, row: row != -1 ? row : null}
      }).filter((cur) => {
        return cur.row != null;
      });
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
  }

}

module.exports = new Controllers.OMEROController().exports();
