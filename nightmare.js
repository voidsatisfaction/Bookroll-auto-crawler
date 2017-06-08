var Nightmare = require('nightmare');		
var nightmare = Nightmare({ show: true });
var fs = require('fs');
var rp = require('request-promise');
var tough = require('tough-cookie');
var htmlParser = require('htmlparser2');
var { URL } = require('url');

var host = 'https://bookroll.let.media.kyoto-u.ac.jp';
var contentURL = [];

var JSESSIONID = '';

// good
nightmare
  /* Login success */
  .goto('https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login')
  .type('#userid', 'br_u03631')
  .type('#password', 'MjMxZDVi')
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
    cookiejar.setCookie(session, 'https://bookroll.let.media.kyoto-u.ac.jp/bookroll');
    
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
      // console.log(myContents);
      return Promise.all(myLectures.map(function (lecture) {
          return parseContent(lecture);
        })).then(function(result) {
          return Array.prototype.concat.apply([], result);
        });
    };

    var parseContentsLists = function(myContents) {
      console.log(myContents);
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
        console.log(uri);
        console.log(filename);
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
          return download(imgURL, fileName, function(){ console.log(f) }); 
        }));
      }));
    };

    /* Actual crawling */
    /* Zenki */ 
    rp(injectURL('https://bookroll.let.media.kyoto-u.ac.jp/bookroll/home/index?firstId=7&beforeId='))
      .then(parseLectures)
      .catch(function (err) {
        console.error(err);
      })
      .then(parseContents)
      .then(parseContentsLists)
      .then(makeFile)
      .then(function() {
        console.log('hack finished');
      });
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });


/* 

1. nightmare를 이용해서 브라우저 상에서 모든것을 행한다.

대신 goto와 같은 것들을 어떻게 동적으로 설정할 것인가에 대한 의문은 있음

다시 로그인해서 계속 새로운 세션을 만드는 방법도 있고..

2. nightmare로 세션만 유지시키고, 파싱은 http request를 이용해서 하는방법.

*/