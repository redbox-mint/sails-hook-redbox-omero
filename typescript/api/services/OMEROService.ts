import {Observable} from 'rxjs';
import {Sails, Model} from 'sails';
import * as requestPromise from "request-promise";
import * as _ from 'lodash';

import { RecordsService, Services as services} from '@researchdatabox/redbox-core-types';


declare var RecordsService: RecordsService, BrandingService;
declare var sails: Sails;
declare var _this;
declare var Institution, User: Model;

export module Services {

  export class OMEROService extends services.Core.Service {

    protected _exportedMethods: any = [
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

    constructor() {
      super();
    }

    cookieJar(jar: any, config: any, key: string, value: string) {
      const keyvalue = key + '=' + value;
      const cookie = requestPromise.cookie('' + keyvalue);
      jar.setCookie(cookie, config.host, function (error, cookie) {
        //sails.log.debug(cookie);
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
      if (cookie) {
        return cookie['value'];
      } else return '';
    }


    csrf(config: any) {
      const get = requestPromise({
        uri: `${config.host}/api/v0/token/`
      });
      return Observable.fromPromise(get);
    }

    login(config: any, csrf: string, user: any) {
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

    projects(config: any, csrf: string, sessionid: string, sessionUuid: string, limit: number, offset: number, owner: number) {
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
      return Observable.fromPromise(get);
    }

    createContainer(config: any, app: any, project: any, containerType: string, groupId: number) {
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
        // formData: {
        //   name: encodeURIComponent(project.name),
        //   folder_type: project.type,
        //   description: encodeURIComponent(project.description),
        //   owner: project.owner || ''
        // },
        headers: {
          'X-CSRFToken': app.csrf,
          'sessionUuid': app.sessionUuid
        }
      });
      return Observable.fromPromise(post);
    }

    annotateMap({config, app, id, annId, mapAnnotation}) {
      let jar = requestPromise.jar();
      jar = this.cookieJar(jar, config, 'csrftoken', app.csrf);
      jar = this.cookieJar(jar, config, 'sessionid', app.sessionid);
      const formData = {
        project: id,
        mapAnnotation: JSON.stringify(mapAnnotation)
      }
      if (annId) {
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


    images({config, app, offset, limit, owner, group, normalize}) {
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
      return Observable.fromPromise(post);
    }

    image({config, app, imageId}) {
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
      return Observable.fromPromise(post);
    }


  }
}
module.exports = new Services.OMEROService().exports();
