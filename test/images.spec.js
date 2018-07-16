require('ts-node/register');

const assert = require('assert');
const supertest = require('supertest');

const OMEROService = require('../api/services/OMEROService');

const username = process.env.username;
const password = process.env.password;
const host = process.env.host;

const user = {
  username: username,
  password: password
};
let app = {};

// Mock this var for typescript
const config = {
  host: host,
  serverId: 1
};

describe('Images tests ::', function () {

  beforeEach(function (done) {

    assert(user.username !== undefined, 'Define username');
    assert(user.password !== undefined, 'Define password');
    assert(config.host !== undefined, 'Define host');

    OMEROService.csrf(config)
      .flatMap(response => {
        csrf = JSON.parse(response);
        return OMEROService.login(config, csrf.data, user);
      })
      .subscribe(response => {
        const cookies = response.headers['set-cookie'];
        const body = JSON.parse(response.body);
        const login = body.eventContext;
        const sessionUuid = login.sessionUuid;
        const cookieJar = OMEROService.getCookies(cookies);
        app = {
          info: {
            csrf: csrf.data,
            sessionid: OMEROService.getCookieValue(cookieJar, 'sessionid'),
            sessionUuid: sessionUuid,
            memberOfGroups: login.memberOfGroups,
            groupId: login.groupId,
            userId: login.userId
          }
        };
        done();
      }, function (response) {
        console.log(response);
        assert(response !== undefined);
        done();
      });
  });

  console.log(app);

  describe('services:', function () {

    it('should have a service', function (done) {
      const offset = 50;
      const limit = 10;
      OMEROService.images({
        config: config, app: app, offset: offset, limit: limit,
        owner: app.userId, group: app.ownerId, normalize: normalize
      }).subscribe(function (response) {
        console.log(response);
        assert(response.status === 200);
        done();
      }, function (error) {
        console.log(error);
      });
    });
  });

});
