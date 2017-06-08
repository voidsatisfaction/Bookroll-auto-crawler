'use strict';

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _htmlparser = require('htmlparser2');

var _htmlparser2 = _interopRequireDefault(_htmlparser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Your Account Info

var id = 'br_u03631';
var password = 'MjMxZDVi';

// Target Info
var loginURL = 'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login';
var csrf = 'a';

// Logics
var userData = { id: id, password: password };

var parse_csrf = function parse_csrf(html) {
  var parser = new _htmlparser2.default.Parser({
    onopentag: function onopentag(name, attr) {
      if (name == 'input' && attr.name == '_csrf') {
        csrf = attr.value;
      }
    }
  }, { decodeEntities: true });
  parser.write(html);
  parser.end();
};

// Execution
var startProcess = function startProcess(userData) {
  (0, _requestPromise2.default)(loginURL).then(function (html) {
    parse_csrf(html);
    return;
  }).then(function () {
    console.log(csrf);
    var options = {
      method: 'POST',
      uri: loginURL,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        userid: userData.id,
        password: userData.password,
        _csrf: csrf
      },
      json: true
    };
    return (0, _requestPromise2.default)(options).then(function (html) {
      return html;
    });
  }).catch(function (err) {
    console.log('post err');
    console.error(err);
  }).then(function (data) {
    console.log(data);
  });
};

startProcess(userData);