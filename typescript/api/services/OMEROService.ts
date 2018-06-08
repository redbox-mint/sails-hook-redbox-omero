import {Observable, Scheduler} from 'rxjs/Rx';
import {Sails, Model} from 'sails';
import * as requestPromise from 'request-promise';
import * as tough from "tough-cookie";
declare var _;

import services = require('../core/CoreService.js');

declare var RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class OMEROService extends services.Services.Core.Service {

    protected _exportedMethods: any = [
      'csrf',
      'login',
      'projects',
      'createContainer',
      'annotateMap',
      'annotations',
      'getCookies',
      'getCookieValue'
    ];

    constructor() {
      super();
    }

    cookieJar(jar: any, config:any, key: string, value: string){
      const keyvalue = key + '=' + value;
      const cookie = requestPromise.cookie('' + keyvalue);
      jar.setCookie(cookie, config.host, function(error, cookie) {
        sails.log.debug(cookie);
      });
      return jar;
    }

    getCookies(cookies) {
      const cookieJar = [];
      cookies.forEach((rawcookies) => {
        var cookie = requestPromise.cookie(rawcookies);
        cookieJar.push({key: cookie.key, value: cookie.value, expires: cookie.expires});
      });
      return cookieJar;
    }

    getCookieValue(cookieJar, key) {
      const cookie = _.find(cookieJar, {key: key});
      if(cookie) {
        return cookie['value'];
      }else return '';
    }


    csrf(config: any) {
      const get = requestPromise({
        uri: `${config.host}/api/v0/token/`
      });
      return Observable.fromPromise(get);
    }

    login(config: any, csrf: string, user: any) {
      sails.log.debug('login');
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
      return Observable.fromPromise(post);
    }

    projects(config: any, csrf: string, sessionid: string, sessionUuid: string) {
      let jar = requestPromise.jar();
      jar = this.cookieJar(jar, config, 'csrftoken', csrf);
      jar = this.cookieJar(jar, config, 'sessionid', sessionid);
      const get = requestPromise({
        uri: `${config.host}/api/v0/m/projects/`,
        jar: jar,
        headers: {
          'X-CSRFToken': csrf,
          'sessionUuid': sessionUuid
        }
      });
      return Observable.fromPromise(get);
    }

    createContainer(config: any, app: any, project: any) {
      let jar = requestPromise.jar();
      jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
      jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
      const post = requestPromise({
        uri: `${config.host}/webclient/action/addnewcontainer/`,
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
      return Observable.fromPromise(post);
    }

    annotateMap({config, app, id, annId, mapAnnotation}){
      let jar = requestPromise.jar();
      jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
      jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
      const formData = {
        project: id,
        mapAnnotation: JSON.stringify(mapAnnotation)
      }
      if(annId) {
        formData['annId'] = annId
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
      return Observable.fromPromise(post);
    }

    annotations({config, app, id}) {
      //https://omero-dev.research.uts.edu.au/webclient/api/annotations/?type=map&project=2&_=1520396924499
      //Return: {"annotations":
      //[{"description": null, "class": "MapAnnotationI", "date": "2018-03-07T06:28:24Z", "link": {"owner": {"id": 2}, "date": "2018-03-07T06:28:24Z", "id": 5, "parent": {"id": 2, "name": "test-project", "class": "ProjectI"}, "permissions": {"canAnnotate": true, "canEdit": true, "canDelete": true, "canLink": true}}, "owner": {"id": 2}, "values": [["stash", "123123123"]], "ns": "openmicroscopy.org/omero/client/mapAnnotation", "id": 5, "permissions": {"canAnnotate": true, "canEdit": true,"canDelete": true, "canLink": true}}], "experimenters": [{"lastName": "Sacal Bonequi", "omeName": "135553", "id": 2, "firstName": "Moises"}]
      //}
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
      return Observable.fromPromise(get);
    }


  }
}
module.exports = new Services.OMEROService().exports();
