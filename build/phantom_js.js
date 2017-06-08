'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var page = require('webpage').create();

var BookrollHaker = function () {
  function BookrollHaker(_ref) {
    var id = _ref.id,
        password = _ref.password;

    _classCallCheck(this, BookrollHaker);

    this.id = id;
    this.password = password;
    this.csrf = '';
    this.lecturesCode = [];
  }

  _createClass(BookrollHaker, [{
    key: 'getHiddenLoginData',
    value: function getHiddenLoginData() {
      var _this = this;

      page.open('https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login', function (status) {
        var csrf = page.evaluate(function () {
          return document.getElementsByName('_csrf')[1].value;
        });
        _this.csrf = csrf;
        _this.login();
        phantom.exit();
      });
    }
  }, {
    key: 'login',
    value: function login() {
      var postBody = 'userid=' + this.id + '&password=' + this.password + '&_csrf=' + this.csrf;
      page.open('https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login', 'POST', postBody, function (status) {
        console.log(status);
        console.log(page.content);
        phantom.exit();
      });
    }
  }]);

  return BookrollHaker;
}();

// Input user id and password


var id = 'br_u03631';
var password = 'MjMxZDVi';
var bookroll = new BookrollHaker({ id: id, password: password });

bookroll.getHiddenLoginData();