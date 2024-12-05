declare var module;
declare var sails, Model;
declare var _;

import {Observable, of} from 'rxjs';

declare var BrandingService, WorkspaceService, RecordsService, OMEROService;
/**
 * Package that contains all Controllers.
 */
import { Controllers as controller} from '@researchdatabox/redbox-core-types';

export module Controllers {

  /**
   * Omero related features....
   *
   */
  export class OMEROController extends controller.Core.Controller {

    protected _exportedMethods: any = [
      'info',
      'login',
      'projects',
      'create',
      'link',
      'checkLink',
      'images'
    ];

    protected config: any;

    constructor() {
      super();
      this.config = new Config();
    }

    public info(req, res) {
      this.config.set();
      this.ajaxOk(req, res, null, {host: this.config.host, status: true});
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
        sails.services.omeroservice.csrf(this.config)
          .flatMap(response => {
            csrf = JSON.parse(response);
            return sails.services.omeroservice.login(this.config, csrf.data, user);
          })
          .flatMap(response => {
            const cookies = response.headers['set-cookie'];
            const body = JSON.parse(response.body);
            const login = body.eventContext;
            const sessionUuid = login.sessionUuid;
            const cookieJar = sails.services.omeroservice.getCookies(cookies);
            info = {
              csrf: csrf.data,
              sessionid: sails.services.omeroservice.getCookieValue(cookieJar, 'sessionid'),
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
            sails.log.debug('projects:workspaceAppFromUserId');
            if (response.info) {
              const app = response.info;
              return sails.services.omeroservice.projects(this.config, app.csrf, app.sessionid, app.sessionUuid, limit, offset, app.userId);
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
            return sails.services.omeroservice.createContainer(this.config, app, project, 'Project', app.groupId || this.config.defaultGroupId);
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
            return sails.services.omeroservice.annotations({config: this.config, app: app, id: record.omeroId});
          }).flatMap(response => {
            sails.log.debug('annotations');
            response = (JSON.parse(response));
            mapAnnotation = response['annotations'];
            //Check whether there is a workspace created
            const ann = this.findAnnotation('stash', mapAnnotation);
            if (!ann) {
              rowAnnotation = undefined;
              idAnnotation = undefined;
              return this.createAnnotation({
                app: app, record: record, rowAnnotation: rowAnnotation,
                idAnnotation: idAnnotation, annotations: annotations, username: username,
                rdmp: rdmp, brandingAndPortalUrl: this.config.brandingAndPortalUrl
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
            return sails.services.omeroservice.annotations({
              config: this.config, app: app, id: omeroId
            })
          }).subscribe(async (response) => {
            try {
              response = JSON.parse(response) || {};
              mapAnnotation = response.annotations || null;
            } catch (e) {
              mapAnnotation = [];
            }
            sails.log.verbose(`OMEROController annotation info: ${JSON.stringify(mapAnnotation)}`)
            //Check whether there is a workspace created
            // const ann = _.first(this.findAnnotation('stash', mapAnnotation));// Trying to find an annotation like this: e0582136e22f13059f5d36769282403d.75a2c64ca8c7ad77e9a68adc11e2015b
            // if (ann) {
            //   info = this.workspaceInfoFromRepo(mapAnnotation[ann.index]['values'][ann.row][1]);
            // }
            const annEntry = this.findAnnotation('stash', mapAnnotation);// Trying to find an annotation like this: e0582136e22f13059f5d36769282403d.75a2c64ca8c7ad77e9a68adc11e2015b
            sails.log.verbose(`OMEROController annotation entry: ${JSON.stringify(annEntry)}`)
            if (annEntry) {
              info = this.workspaceInfoFromRepo(annEntry);
            }
            const recordInfo = await RecordsService.getMeta(rdmpId);
            const recordMetadata = recordInfo['metadata'];
            if (recordMetadata && recordMetadata['workspaces']) {
              sails.log.verbose(`OMEROController recordMetadata workspaces: ${JSON.stringify(recordMetadata['workspaces'])}`)
              const wss = recordMetadata.workspaces.find((wrk) => info['workspaceId'] == wrk.id);
              if (info['rdmpId']) {
                // the workspace is linked to a record
                check.ws = true;
              }
              if (wss && rdmpId == info['rdmpId']) {
                // the workspace is linked to this record
                check.omero = true;
              }
            }
            this.ajaxOk(req, res, null, {status: true, check: check});
          }, error => {
            const errorMessage = `Failed compare link workspace project: ${omeroId}`;
            //sails.log.error(error);
            sails.log.error(errorMessage);
            this.ajaxFail(req, res, errorMessage, error);
          });
      }
    }

    createAnnotation({app, record, rowAnnotation, idAnnotation, annotations, username, rdmp, brandingAndPortalUrl}) {
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
          sails.log.verbose(`createAnnotation -> createWorkspaceRecord:`);
          sails.log.verbose(response);
          // FIXED: response is now an Axios response, adding '.data' path
          workspaceId = response.data.workspaceOid;
          const create = this.mapAnnotation(
            rowAnnotation,
            this.getAnnotation(idAnnotation, annotations),
            'stash',
            `${rdmp}.${workspaceId}`,
            'stash RDMP',
            `${brandingAndPortalUrl}/record/view/${rdmp}`
          );
          const annId = idAnnotation || null;
          const mapAnnotation = create.values;
          return sails.services.omeroservice.annotateMap({
            config: this.config, app: app, id: record.omeroId,
            annId: annId, mapAnnotation: mapAnnotation
          });
        })
        // .flatMap(() => {
        //   if (recordMetadata.workspaces) {
        //     const wss = recordMetadata.workspaces.find(id => workspaceId === id);
        //     if (!wss) {
        //       recordMetadata.workspaces.push({id: workspaceId});
        //     }
        //   }
        //   return WorkspaceService.updateRecordMeta(this.config, recordMetadata, rdmp);
        // });
    }

    getAnnotation(id: number, annotations: any) {
      return annotations.find(an => an.id === id);
    }

    mapAnnotation(row: number, annotation: any, key, newValue: string, humanKey: string, humanAnnotation: string) {
      //OMERO stores annotations as array of arrays. Each element being array[0] property and array[1] value
      if (annotation) {
        annotation.values[row.toString()][1] = newValue;
        return annotation;
      } else {
        const annotation = {
          values: [[key, newValue.toString()], [humanKey, humanAnnotation]]
        };
        return annotation;
      }
    }

    findAnnotation(annotation: string, annotations: any[]) {
      // 2024-03-26 Refactor, current annotations data structure is array of objects, e.g. :
      // [
      //   {
      //     "id": 2854,
      //     "ns": "openmicroscopy.org/omero/client/mapAnnotation",
      //     "description": null,
      //     "owner": {
      //       "id": 552
      //     },
      //     "date": "2024-03-26T05:38:49Z",
      //     "permissions": {
      //       "canDelete": true,
      //       "canAnnotate": true,
      //       "canLink": true,
      //       "canEdit": true
      //     },
      //     "link": {
      //       "id": 603,
      //       "owner": {
      //         "id": 552
      //       },
      //       "parent": {
      //         "id": 3153,
      //         "class": "ProjectI",
      //         "name": "test-rb-ws-omero-3"
      //       },
      //       "date": "2024-03-26T05:38:49Z",
      //       "permissions": {
      //         "canDelete": true,
      //         "canAnnotate": true,
      //         "canLink": true,
      //         "canEdit": true
      //       }
      //     },
      //     "class": "MapAnnotationI",
      //     "values": [
      //       [
      //         "stash",
      //         "0c8c48e0e4c311ee917c75953819bfae.0c8c48e0e4c311ee917c75953819bfae"
      //       ],
      //       [
      //         "stash RDMP",
      //         "http://localhost:1500/default/rdmp/record/view/0c8c48e0e4c311ee917c75953819bfae"
      //       ]
      //     ]
      //   }
      // ]
      // Instead of returning the whole annotation object, will now return the actual 'value' entry
      let valEntry = undefined;
      const annVal = _.find(annotations, an => an['values'].find((val) => { if (val[0] == annotation) {valEntry = val[1]} return valEntry != undefined; }));
      sails.log.verbose(`Found stash annotation link: ${JSON.stringify(annVal)}`);
      sails.log.verbose(`Found stash annotation link value: ${valEntry}`)
      
      return valEntry;
      // return annotations.map((anns, index) => {
      //   const row = _.findIndex(anns['values'], an => an[0] === annotation);
      //   return {index: index, id: anns['id'], row: row != -1 ? row : null}
      // }).filter((cur) => {
      //   return cur.row != null;
      // });
    }

    workspaceInfoFromRepo(workspaceLink) {
      if (workspaceLink) {
        const workspaceInfo = workspaceLink.split('.');
        return {rdmpId: _.first(workspaceInfo), workspaceId: _.last(workspaceInfo)};
      } else {
        return {rdmpId: null, workspaceId: null};
      }
    }

    images(req, res) {
      this.config.set();
      if (!req.isAuthenticated()) {
        this.ajaxFail(req, res, `User not authenticated`);
      } else {
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
              return sails.services.omeroservice.images({
                config: this.config, app: app, offset: offset, limit: limit,
                owner: app.userId, group: app.ownerId, normalize: normalize
              });
            } else {
              throw new Error('Missing application credentials');
            }
          }).subscribe(response => {

            this.ajaxOk(req, res, null, {status: true, response: response});
          }, error => {
            const errorMessage = `Failed to get images of user: ${userId}`;
            sails.log.error(errorMessage);
            this.ajaxFail(req, res, errorMessage, error);
          });
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
