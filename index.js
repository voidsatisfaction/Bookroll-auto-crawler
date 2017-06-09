var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true });
var fs = require('fs');
var rp = require('request-promise');
var tough = require('tough-cookie');
var htmlParser = require('htmlparser2');
var { URL } = require('url');

var loginURL = 'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login';
var host = 'https://bookroll.let.media.kyoto-u.ac.jp';

var JSESSIONID = '';

var semester = 'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/home/index?firstId=7&beforeId=';

/* Input your bookroll id and password */

var userId = '';
var userPassword = '';

nightmare
  /* Login success */
  .goto(loginURL)
  .type('#userid', userId)
  .type('#password', userPassword)
  .click('#btn-login')
  .wait('#bookroll-dashboard')
  /* Get all Lectures */
  .cookies.get('JSESSIONID')
  .then(function (result) {
    JSESSIONID = result.value;
    return;
  })
  .then(function () {
    /* Set session */
    var session = new tough.Cookie({
      key: 'JSESSIONID',
      value: JSESSIONID,
      domain: 'bookroll.let.media.kyoto-u.ac.jp',
      maxAge: 31536000
    });

    var cookiejar = rp.jar();
    cookiejar.setCookie(session, host);
    
    /* Intro */

    var intro = function(data) {
      console.log('On processing....');
      return data;
    }

    /* Requests */
    var injectURL = function(uri) {
      var sessionOption = {
        method: 'GET',
        uri: uri,
        jar: cookiejar
      };
      return sessionOption;
    };

    var injectImgURL = function(uri) {
      var sessionOption = {
        method: 'GET',
        uri: uri,
        jar: cookiejar,
        encoding: null
      };
      return sessionOption;
    };    

    var parseLectures = function(html) {
      var myLectures = [];
      var parser = new htmlParser.Parser({
        onopentag: (name, attr) => {
          if(name == 'a' && attr.class == 'directory_close') {
            myLectures.push(host + attr.href);
          }
        },
        ontext: (text) => {
          if (text == 'テスト') {
            myLectures.pop();
          }
        },
      }, { decodeEntities: true });
      parser.write(html);
      parser.end();
      return myLectures;
    };

    var parseContents = function(myLectures) {
      var parseContent = function(lecture) {
        return rp(injectURL(lecture))
          .then(function (html) {
            var url = [];
            var parser = new htmlParser.Parser({
              onopentag: (name, attr) => {
                if(name == 'input' && attr.class == 'viewerUrl') {
                  url.push(attr.value);
                }
              },
            }, { decodeEntities: true });
            parser.write(html);
            parser.end();
            return url;
          });
      };
      return Promise.all(myLectures.map(function (lecture) {
          return parseContent(lecture);
        })).then(function(result) {
          return Array.prototype.concat.apply([], result);
        });
    };

    var parseContentsLists = function(myContents) {
      var parseLists = function(listURL) {
        return rp(injectURL(listURL))
          .then(function (html) {
            return html.split('\n').filter(function (element) {
              return element !== '';
            })
            .map(function (element) {
              return listURL + '/' + element;
            });
          });
      };

      myContents = myContents.map(function(contentURL) {
        var myURL = new URL(contentURL);
        var contentId = myURL.searchParams.get('contents');
        var contentListUrl = host + 
          '/bookroll/contents/unzipped/' +
          contentId +
          '/OPS/images';
        return contentListUrl;
      });
      
      return Promise.all(myContents.map(parseLists))
    };

    var makeFile = function(lists) {
      var download = function(uri, filename, cb){
        return rp(injectImgURL(uri))
          .pipe(fs.createWriteStream(filename))
          .on('close', cb);
      };

      return Promise.all(lists.map(function(list, i) {
        return Promise.all(list.map(function(imgURL, j) {
          var folder = './lecture' + i;
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
          }
          // change file name to jpg numer
          var url_devide = imgURL.split('/');
          var f = url_devide[url_devide.length-1];
          var fileName = folder + '/' + f;
          return download(imgURL, fileName, function(){ return; }); 
        }));
      }));
    };

    /* Main */
    rp(injectURL(semester))
      .then(intro)
      .then(parseLectures)
      .then(parseContents)
      .then(parseContentsLists)
      .then(makeFile)
      .catch(function (err) {
        console.error(err);
      })
      .then(function() {
        console.log('Hack finished');
        console.log('You can exit virtual browser');
      });
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
