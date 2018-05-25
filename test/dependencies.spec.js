const Sails = require('sails').Sails;
const assert = require('assert');
var supertest = require('supertest');

const GithubService = require('../api/services/GithubService');

describe('Basic tests ::', function () {

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

  it('should have a form', function (done) {
    const type = sails.config['form']['forms']['github-1.0-draft']['type'];
    assert.equal(type, 'github');
    done();
  });

  it('should have a recordtype', function (done) {
    const github = sails.config['recordtype']['github'];
    assert.equal(github['packageType'], 'workspace');
    done();
  });

  it('should have a workflow form', function (done) {
    const github = sails.config['workflow']['github'];
    assert.equal(github['draft']['config']['form'], 'github-1.0-draft');
    done();
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
