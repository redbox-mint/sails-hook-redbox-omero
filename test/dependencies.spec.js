const Sails = require('sails').Sails;
const assert = require('assert');
var supertest = require('supertest');

const OMEROService = require('../api/services/OMEROService');

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
        "omero": require('../index.js'),
        // Skip grunt (unless your hook uses it)
        "grunt": false
      },
      form: {forms: {}}, //Mock forms to test hook.configure()
      log: {level: "error"},
      global: true //add sails to a global variable
    }, function (err, _sails) {
      if (err) return done(err);
      sails = _sails;
      return done();
    });
  });

  it('should have a form', function (done) {
    const type = sails.config['form']['forms']['omero-1.0-draft']['type'];
    assert.equal(type, 'omero');
    done();
  });

  it('should have a recordtype', function (done) {
    const omero = sails.config['recordtype']['omero'];
    assert.equal(omero['packageType'], 'workspace');
    done();
  });

  it('should have a workflow form', function (done) {
    const omero = sails.config['workflow']['omero'];
    assert.equal(omero['draft']['config']['form'], 'omero-1.0-draft');
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
