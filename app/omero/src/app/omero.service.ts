import {Injectable, Inject} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';

import {BaseService} from './shared/base-service';
import {ConfigService} from './shared/config-service';

@Injectable()
export class OMEROService extends BaseService {

  protected baseUrl: any;
  public recordURL: string = this.brandingAndPortalUrl + '/record/view';
  protected initSubject: any;

  constructor(@Inject(Http) http: Http,
              @Inject(ConfigService) protected configService: ConfigService) {
    super(http, configService);
    this.initSubject = new Subject();
    this.emitInit();
  }

  public waitForInit(handler: any) {
    const subs = this.initSubject.subscribe(handler);
    this.emitInit();
    return subs;
  }

  protected emitInit() {
    if (this.brandingAndPortalUrl) {
      this.initSubject.next('');
    }
  }

  session(login) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/login';
    return this.http.post(
      wsUrl,
      {username: login.username, password: login.password},
      this.options
    )
      .toPromise()
      .then((res: any) => {
        return this.extractData(res);
      })
      .catch((res: any) => {
        return this.extractData(res);
      });
  }

  projects(limit: number, offset: number) {
    const wsUrl = `${this.brandingAndPortalUrl}/ws/omero/projects/${limit}/${offset}`;
    return this.http.get(
      wsUrl,
      this.options
    )
      .toPromise()
      .then((res: any) => {
        return this.extractData(res);
      })
      .catch((res: any) => {
        return this.extractData(res);
      });
  }

  createWorkspace(creation) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/create';
    return this.http.post(
      wsUrl,
      {creation: creation},
      this.options
    )
      .toPromise()
      .then((res: any) => {
        return this.extractData(res);
      })
      .catch((res: any) => {
        return this.extractData(res);
      });
  }

  link({rdmp, project, recordMap}) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/link';
    return this.http.post(
      wsUrl,
      {rdmp: rdmp, project: project, recordMap: recordMap},
      this.options
    )
      .toPromise()
      .then((res: any) => {
        return this.extractData(res);
      })
      .catch((res: any) => {
        return this.extractData(res);
      });
  }

  checkLink({rdmpId, omeroId}) {
    const wsUrl = this.brandingAndPortalUrl + '/ws/omero/checkLink';
    return this.http.post(
      wsUrl,
      {rdmpId: rdmpId, omeroId: omeroId},
      this.options
    )
      .toPromise()
      .then((res: any) => {
        return this.extractData(res);
      })
      .catch((res: any) => {
        return this.extractData(res);
      });
  }


}
