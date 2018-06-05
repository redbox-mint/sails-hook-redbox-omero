require('ts-node/register');

const Sails = require('sails').Sails;
const assert = require('assert');
var supertest = require('supertest');

const GithubService = require('../api/services/GithubService');

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
        "sails-hook-redbox-github": require('../index.js'),
        // Skip grunt (unless your hook uses it)
        "grunt": false
      },
      form: {forms: {}}, //Mock forms to test hook.configure()
      log: {level: "error"}
    }, function (err, _sails) {
      if (err) return done(err);
      sails = _sails;
      return done();
    });
  });

  it('should have a service', function (done) {
    sails.services.GithubService.projects(username, password).subscribe(function (response) {
      assert(response.status === 200);
      done();
    });
  });

  it('should have a route', function (done) {
    supertest(sails.hooks.http.app)
      .get('/:branding/:portal/ws/github/projects')
      .query({username: username, password: password})
      .expect(200)
      .end(function (err, res) {
        assert(res.response.length > 0);
        done();
      });
  });

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
