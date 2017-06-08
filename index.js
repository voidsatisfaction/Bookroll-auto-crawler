import https from 'https';
import rp from 'request-promise';
import htmlParser from 'htmlparser2';

// Your Account Info

const id = 'br_u03631';
const password = 'MjMxZDVi';

// Target Info
const loginURL = 'https://bookroll.let.media.kyoto-u.ac.jp/bookroll/login';
let csrf = 'a';

// Logics
const userData = { id, password };

const parse_csrf = (html) => {
  const parser = new htmlParser.Parser({
    onopentag: (name, attr) => {
      if(name == 'input' && attr.name == '_csrf') {
        csrf = attr.value;
      }
    },
  }, { decodeEntities: true });
  parser.write(html);
  parser.end();
}

// Execution
const startProcess = (userData) => {
  rp(loginURL)
    .then((html) => {
      parse_csrf(html);
      return;
    })
    .then(() => {
      console.log(csrf);
      const options = {
        method: 'POST',
        uri: loginURL,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        form: {
          userid: userData.id,
          password: userData.password,
          _csrf: csrf,
        },
        json: true,
      }
      return rp(options).then((html) => (html));
    })
    .catch((err) => {
      console.log('post err');
      console.error(err);
    })
    .then((data) => {
      console.log(data);
    });
};

startProcess(userData);