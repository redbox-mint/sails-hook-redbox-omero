require('ts-node/register');

const Sails = require('sails').Sails;
const assert = require('assert');
var supertest = require('supertest');

const OMEROService = require('../api/services/OMEROService');

const username = process.env.username;
const password = process.env.password;

describe('Projects tests ::', function () {

  // Var to hold a running sails app instance
  var sails;
  // Before running any tests, attempt to lift Sails
  before(function (done) {

    // Hook will timeout in 10 seconds
    this.timeout(11000);

    // Attempt to lift sails
    Sails().lift({
      hooks: {
        // Load the hook
        "omero": require('../index.js'),
        // Skip grunt (unless your hook uses it)
        "grunt": false
      },
      form: {forms: {}}, //Mock forms to test hook.configure()
      log: {level: "error"},
      global: true
    }, function (err, _sails) {
      if (err) return done(err);
      sails = _sails;
      return done();
    });
  });

  if (username && password) {
    it('should have a service', function (done) {
      sails.services.OMEROService.projects(username, password).subscribe(function (response) {
        assert(response.status === 200);
        done();
      });
    });

    it('should have a route', function (done) {
      supertest(sails.hooks.http.app)
        .get('/:branding/:portal/ws/omero/projects')
        .query({username: username, password: password})
        .expect(200)
        .end(function (err, res) {
          assert(res.response.length > 0);
          done();
        });
    });
  } else {
    it('should have username and password to run the test', function (done) {
      assert(false, 'Define username and password with ENV vars');
      done();
    });
  }

  // After tests are complete, lower Sails
  after(function (done) {

    // Lower Sails (if it successfully lifted)
    if (sails) {
      return sails.lower(done);
    }
    // Otherwise just return
    return done();
  });

  // Test that Sails can lift with the hook in place
  it('sails does not crash', function () {
    return true;
  });

});
